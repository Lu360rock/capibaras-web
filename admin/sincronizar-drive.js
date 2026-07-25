const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { authenticate } = require("@google-cloud/local-auth");
const mime = require("mime-types");

// Carpeta principal "Capibaras Galería" en Google Drive
const DRIVE_ROOT_FOLDER_ID = "14aJ7EmDPgsFiW_BzPdcS1Sn-F-LGwDRR";

// Temporada que estamos trabajando
const TEMPORADA = "2026";

const MODO_PRUEBA = false;

// Carpeta local donde están las fotografías originales
const CARPETA_LOCAL = path.join(
    "D:",
    "capibaras-galeria",
    "temporadas",
    TEMPORADA
);

// Archivos del proyecto
const CREDENTIALS_PATH = path.join(
    __dirname,
    "credentials.json"
);

const TOKEN_PATH = path.join(
    __dirname,
    "token.json"
);

const PARTIDOS_JSON = path.join(
    __dirname,
    "..",
    "datos",
    "partidos.json"
);

const DRIVE_MAP_JSON = path.join(
    __dirname,
    "..",
    "datos",
    "drive-map.json"
);

// Tipos de archivo permitidos
const EXTENSIONES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4"
];

function leerJSON(ruta) {

    return JSON.parse(
        fs.readFileSync(ruta, "utf8")
    );

}

function guardarJSON(ruta, datos) {

    fs.writeFileSync(
        ruta,
        JSON.stringify(datos, null, 2),
        "utf8"
    );

}

function escaparTextoDrive(texto) {

    return texto
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}

async function cargarTokenGuardado() {

    if (!fs.existsSync(TOKEN_PATH)) {

        return null;

    }

    try {

        const token = leerJSON(TOKEN_PATH);

        return google.auth.fromJSON(token);

    } catch (error) {

        return null;

    }

}

async function guardarToken(cliente) {

    const credenciales = leerJSON(CREDENTIALS_PATH);

    const datosCliente =
        credenciales.installed ||
        credenciales.web;

    const token = {

        type: "authorized_user",

        client_id:
            datosCliente.client_id,

        client_secret:
            datosCliente.client_secret,

        refresh_token:
            cliente.credentials.refresh_token

    };

    guardarJSON(
        TOKEN_PATH,
        token
    );

}

async function autorizarGoogle() {

    let cliente =
        await cargarTokenGuardado();

    if (cliente) {

        return cliente;

    }

    cliente = await authenticate({

        scopes: [
            "https://www.googleapis.com/auth/drive"
        ],

        keyfilePath:
            CREDENTIALS_PATH

    });

    await guardarToken(cliente);

    return cliente;

}

async function buscarElementoEnDrive(
    drive,
    parentId,
    nombre,
    mimeType = null
) {

    const condiciones = [
        `'${escaparTextoDrive(parentId)}' in parents`,
        `name = '${escaparTextoDrive(nombre)}'`,
        "trashed = false"
    ];

    if (mimeType) {

        condiciones.push(
            `mimeType = '${escaparTextoDrive(mimeType)}'`
        );

    }

    const respuesta = await drive.files.list({

        q: condiciones.join(" and "),

        fields:
            "files(id, name, mimeType)",

        spaces:
            "drive",

        pageSize:
            100

    });

    if (
        respuesta.data.files &&
        respuesta.data.files.length > 0
    ) {

        return respuesta.data.files[0];

    }

    return null;

}

async function crearCarpetaSiNoExiste(
    drive,
    parentId,
    nombre
) {

    const MIME_CARPETA =
        "application/vnd.google-apps.folder";

    const carpetaExistente =
        await buscarElementoEnDrive(
            drive,
            parentId,
            nombre,
            MIME_CARPETA
        );

    if (carpetaExistente) {

        return carpetaExistente.id;

    }

    const respuesta =
        await drive.files.create({

            requestBody: {

                name:
                    nombre,

                mimeType:
                    MIME_CARPETA,

                parents: [
                    parentId
                ]

            },

            fields:
                "id"

        });

    console.log(
        `Carpeta creada en Drive: ${nombre}`
    );

    return respuesta.data.id;

}

async function hacerArchivoPublico(
    drive,
    fileId
) {

    try {

        await drive.permissions.create({

            fileId,

            requestBody: {

                type:
                    "anyone",

                role:
                    "reader"

            }

        });

    } catch (error) {

        const estado =
            error?.response?.status;

        if (
            estado !== 400 &&
            estado !== 403
        ) {

            throw error;

        }

    }

}

async function subirArchivoSiNoExiste(
    drive,
    parentId,
    rutaLocal
) {

    const nombre =
        path.basename(rutaLocal);

    const existente =
        await buscarElementoEnDrive(
            drive,
            parentId,
            nombre
        );

    if (existente) {

        console.log(
            `Ya existe: ${nombre}`
        );

        return existente.id;

    }

    const respuesta =
        await drive.files.create({

            requestBody: {

                name:
                    nombre,

                parents: [
                    parentId
                ]

            },

            media: {

                mimeType:
                    mime.lookup(rutaLocal) ||
                    "application/octet-stream",

                body:
                    fs.createReadStream(
                        rutaLocal
                    )

            },

            fields:
                "id, name"

        });

    await hacerArchivoPublico(
        drive,
        respuesta.data.id
    );

    console.log(
        `Subida: ${nombre}`
    );

    return respuesta.data.id;

}

function obtenerArchivosDeCarpeta(rutaCarpeta) {

    return fs
        .readdirSync(
            rutaCarpeta,
            {
                withFileTypes: true
            }
        )
        .filter(
            elemento =>
                elemento.isFile()
        )
        .map(
            elemento =>
                elemento.name
        )
        .filter(
            nombre =>
                EXTENSIONES.includes(
                    path
                        .extname(nombre)
                        .toLowerCase()
                )
        )
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "es",
                    {
                        numeric: true
                    }
                )
        );

}

function generarURLDrive(fileId) {

    return (
        "https://drive.google.com/thumbnail" +
        `?id=${encodeURIComponent(fileId)}` +
        "&sz=w2000"
    );

}

async function ejecutar() {

    if (
        !fs.existsSync(
            CREDENTIALS_PATH
        )
    ) {

        throw new Error(
            "No se encontró admin/credentials.json"
        );

    }

    if (
        !fs.existsSync(
            PARTIDOS_JSON
        )
    ) {

        throw new Error(
            "No se encontró datos/partidos.json"
        );

    }

    if (
        !fs.existsSync(
            CARPETA_LOCAL
        )
    ) {

        throw new Error(
            `No se encontró la carpeta local:\n${CARPETA_LOCAL}`
        );

    }

    const auth =
        await autorizarGoogle();

    // Obliga a todas las llamadas de Google APIs
    // a utilizar la cuenta que acabamos de autorizar.
    google.options({
        auth
    });

    const drive =
        google.drive({
            version: "v3",
            auth
        });

    const partidos =
        leerJSON(
            PARTIDOS_JSON
        );

    const carpetaTemporadasDrive =
        await crearCarpetaSiNoExiste(
            drive,
            DRIVE_ROOT_FOLDER_ID,
            "temporadas"
        );

    const carpetaTemporadaDrive =
        await crearCarpetaSiNoExiste(
            drive,
            carpetaTemporadasDrive,
            TEMPORADA
        );

    const mapaDrive = {

        temporada:
            TEMPORADA,

        generado:
            new Date().toISOString(),

        partidos:
            {}

    };

    for (
        const partido
        of partidos
    ) {

        const rutaJornada =
            path.join(
                CARPETA_LOCAL,
                partido.carpeta
            );

        if (
            !fs.existsSync(
                rutaJornada
            )
        ) {

            console.log(
                `Carpeta local no encontrada: ${partido.carpeta}`
            );

            continue;

        }

        console.log(
            `\nProcesando: ${partido.carpeta}`
        );

        const carpetaJornadaDrive =
            await crearCarpetaSiNoExiste(
                drive,
                carpetaTemporadaDrive,
                partido.carpeta
            );

        const archivos =
            obtenerArchivosDeCarpeta(
                rutaJornada
            );

        const imagenes = [];

        for (
            const archivo
            of archivos
        ) {

            const rutaArchivo =
                path.join(
                    rutaJornada,
                    archivo
                );

            const fileId =
                await subirArchivoSiNoExiste(
                    drive,
                    carpetaJornadaDrive,
                    rutaArchivo
                );

            imagenes.push({

                archivo,

                fileId,

                url:
                    generarURLDrive(
                        fileId
                    )

            });

        }

        partido.totalFotos =
            imagenes.length;

        mapaDrive.partidos[
            String(partido.id)
        ] = {

            id:
                partido.id,

            carpeta:
                partido.carpeta,

            driveFolderId:
                carpetaJornadaDrive,

            totalFotos:
                imagenes.length,

            imagenes

        };

        if (MODO_PRUEBA) {

            console.log(
                "\nModo prueba: se procesó solamente una jornada."
            );

            break;

        }

    }

    guardarJSON(
        PARTIDOS_JSON,
        partidos
    );

    guardarJSON(
        DRIVE_MAP_JSON,
        mapaDrive
    );

    console.log(
        "\nSincronización terminada."
    );

    console.log(
        "datos/drive-map.json generado."
    );

    console.log(
        "datos/partidos.json actualizado."
    );

}

ejecutar()
    .catch(
        error => {

            console.error(
                "\nERROR:"
            );

            console.error(
                error.message
            );

            if (
                error?.response?.data
            ) {

                console.error(
                    JSON.stringify(
                        error.response.data,
                        null,
                        2
                    )
                );

            }

            process.exitCode = 1;

        }
    );