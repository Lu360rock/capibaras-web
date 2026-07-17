const fs = require("fs");
const path = require("path");

const TEMPORADAS = path.join(__dirname, "..", "temporadas", "2026");
const PARTIDOS_JSON = path.join(__dirname, "..", "datos", "partidos.json");
const CARRUSEL_JSON = path.join(__dirname, "..", "datos", "carrusel.json");

const EXTENSIONES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".mp4",
    ".JPG",
    ".JPEG",
    ".PNG",
    ".WEBP",
    ".GIF",
    ".MP4"
];

const partidos = JSON.parse(
    fs.readFileSync(PARTIDOS_JSON, "utf8")
);

const carrusel = [];

partidos.forEach(partido => {

    const ruta = path.join(TEMPORADAS, partido.carpeta);

    if (!fs.existsSync(ruta)) {

        partido.totalFotos = 0;
        console.log(`✖ ${partido.carpeta} (carpeta no encontrada)`);
        return;

    }

    const imagenes = fs.readdirSync(ruta)
        .filter(archivo =>
            EXTENSIONES.includes(path.extname(archivo))
        )
        .sort();

    partido.totalFotos = imagenes.length;

    const galeria = imagenes.map(archivo => ({

        archivo

    }));

    fs.writeFileSync(
        path.join(ruta, "galeria.json"),
        JSON.stringify(galeria, null, 2),
        "utf8"
    );

    imagenes.forEach(archivo => {

        carrusel.push({

            partido: partido.id,

            imagen: `temporadas/2026/${partido.carpeta}/${archivo}`

        });

    });

    console.log(`✔ ${partido.carpeta} (${imagenes.length} fotografías)`);

});

fs.writeFileSync(
    PARTIDOS_JSON,
    JSON.stringify(partidos, null, 2),
    "utf8"
);

fs.writeFileSync(
    CARRUSEL_JSON,
    JSON.stringify(carrusel, null, 2),
    "utf8"
);

console.log("\n✔ partidos.json actualizado.");
console.log("✔ carrusel.json generado.");
console.log("✔ Galerías generadas correctamente.");