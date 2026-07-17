const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const carpetaBase = path.join(__dirname, "..", "temporadas", "2026");

const extensiones = [".jpg", ".jpeg", ".JPG", ".JPEG"];

async function optimizar(carpeta) {

    const archivos = fs.readdirSync(carpeta);

    for (const archivo of archivos) {

        const ruta = path.join(carpeta, archivo);

        const estadisticas = fs.statSync(ruta);

        if (estadisticas.isDirectory()) {

            await optimizar(ruta);
            continue;

        }

        if (!extensiones.includes(path.extname(archivo))) {
            continue;
        }

        try {

            const temporal = ruta + ".tmp";

            await sharp(ruta)
                .rotate()
                .resize({
                    width: 2800,
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: 88,
                    mozjpeg: true
                })
                .toFile(temporal);

            fs.unlinkSync(ruta);
            fs.renameSync(temporal, ruta);

            console.log("✔", archivo);

        } catch (error) {

            console.log("✖", archivo);

        }

    }

}

optimizar(carpetaBase)
.then(() => {

    console.log("\nOptimización terminada.");

});

