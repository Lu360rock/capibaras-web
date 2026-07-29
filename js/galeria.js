let imagenes = [];
let indiceActual = 0;
let zoom = 1;

let driveMap = null;

async function obtenerDriveMap() {
    if (driveMap) return driveMap;

    const respuesta = await fetch("datos/drive-map.json?v=1");
    driveMap = await respuesta.json();

    return driveMap;
}

const parametros = new URLSearchParams(window.location.search);
const id = Number(parametros.get("partido"));

Promise.all([
    fetch("datos/partidos.json").then(r => r.json()),
    obtenerDriveMap()
])
.then(([partidos, drive]) => {

        const partido = partidos.find(p => p.id === id);

        if (!partido) {
            document.getElementById("tituloPartido").textContent = "Partido no encontrado";
            return;
        }

        document.getElementById("tituloPartido").textContent =
            `${partido.jornada} vs ${partido.rival}`;

        document.getElementById("detallePartido").innerHTML = `
            <strong>Fecha:</strong> ${partido.fecha}<br>
            <strong>Lugar:</strong> ${partido.lugar}<br>
            <strong>Resultado:</strong> ${partido.resultado}
        `;

       const drivePartido = drive.partidos[String(partido.id)];

       return {
           partido,
           imagenes: drivePartido.imagenes,
           drivePartido
     };

    })
    .then(datos => {

       if (!datos) return;

      imagenes = datos.imagenes
          .filter(imagen => {

              const extension =
                  imagen.archivo.split(".").pop().toLowerCase();

              return extension !== "mp4";

         })
         .map(imagen => {

             const fotoDrive = datos.drivePartido.imagenes.find(
                 f => f.archivo === imagen.archivo
             );

             return fotoDrive
                 ? fotoDrive.url
                 : `temporadas/2026/${datos.partido.carpeta}/${imagen.archivo}`;

         });

       const galeria = document.getElementById("galeria");

        datos.imagenes.forEach((imagen, indice) => {

            const tarjeta = document.createElement("div");

            tarjeta.className = "foto";

            const fotoDrive = datos.drivePartido.imagenes.find(
                f => f.archivo === imagen.archivo
            );

            const ruta = fotoDrive
                ? fotoDrive.url
                : `temporadas/2026/${datos.partido.carpeta}/${imagen.archivo}`;

            const extension = imagen.archivo.split(".").pop().toLowerCase();

            if (extension === "mp4" && fotoDrive?.fileId) {

                const urlVideo =
                    `https://drive.google.com/file/d/${encodeURIComponent(fotoDrive.fileId)}/preview`;

                tarjeta.innerHTML = `
                    <a
                        href="${urlVideo}"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Reproducir video"
                        style="
                            display: block;
                            width: 100%;
                            height: 100%;
                            text-decoration: none;
                        ">

                        <div style="
                            position: relative;
                            width: 100%;
                            min-height: 300px;
                            height: 100%;
                            background-image: url('${fotoDrive.url}');
                            background-size: cover;
                            background-position: center;
                            border-radius: 10px;
                            overflow: hidden;
                        ">

                            <span style="
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                width: 70px;
                                height: 70px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                border-radius: 50%;
                                background: rgba(0, 0, 0, 0.75);
                                color: white;
                                font-size: 34px;
                                padding-left: 5px;
                            ">
                                ▶
                            </span>

                        </div>
                    </a>
                `;

            } else if (extension === "mp4") {

                tarjeta.innerHTML = `
                    <video
                        controls
                        preload="metadata"
                        playsinline>
                        <source src="${ruta}" type="video/mp4">
                    </video>
                `;

            } else {

                tarjeta.innerHTML = `
                    <img
                        src="${ruta}"
                        alt="Fotografía del partido ${datos.partido.jornada} contra ${datos.partido.rival}"
                        loading="lazy"
                        data-indice="${imagenes.indexOf(ruta)}"
                        data-imagen="${ruta}">
                `;

            }

            galeria.appendChild(tarjeta);

        });

    })
    .catch(error => {

        console.error(error);

        document.getElementById("tituloPartido").textContent =
            "Error al cargar la galería.";

    });

    document.addEventListener("click", (evento) => {

    if(evento.target.matches(".foto img")){

        indiceActual = Number(evento.target.dataset.indice);

        document.getElementById("imagenGrande").src =
            imagenes[indiceActual];

        zoom = 1;
        document.getElementById("imagenGrande").style.transform = "scale(1)";    

        document.getElementById("contadorFotos").textContent =
            `${indiceActual + 1} / ${imagenes.length}`;    

        document.getElementById("visor")
            .classList.remove("oculto");

    }

});

document.getElementById("cerrarVisor")
.addEventListener("click", ()=>{

    document.getElementById("visor")
        .classList.add("oculto");

});

document.getElementById("anterior").addEventListener("click", () => {

    indiceActual--;

    if(indiceActual < 0){
        indiceActual = imagenes.length - 1;
    }

    document.getElementById("imagenGrande").src =
        imagenes[indiceActual];

    zoom = 1;
    document.getElementById("imagenGrande").style.transform = "scale(1)";

    document.getElementById("contadorFotos").textContent =
        `${indiceActual + 1} / ${imagenes.length}`;

});

document.getElementById("siguiente").addEventListener("click", () => {

    indiceActual++;

    if(indiceActual >= imagenes.length){
        indiceActual = 0;
    }

    document.getElementById("imagenGrande").src =
        imagenes[indiceActual];

    zoom = 1;
    document.getElementById("imagenGrande").style.transform = "scale(1)";

    document.getElementById("contadorFotos").textContent =
        `${indiceActual + 1} / ${imagenes.length}`;

});

document.addEventListener("keydown", (evento) => {

    const visor = document.getElementById("visor");

    if(visor.classList.contains("oculto")) return;

    if(evento.key === "Escape"){

        visor.classList.add("oculto");

    }

    if(evento.key === "ArrowLeft"){

        indiceActual--;

        if(indiceActual < 0){
            indiceActual = imagenes.length - 1;
        }

        document.getElementById("imagenGrande").src =
            imagenes[indiceActual];

        document.getElementById("contadorFotos").textContent =
            `${indiceActual + 1} / ${imagenes.length}`;

    }

    if(evento.key === "ArrowRight"){

        indiceActual++;

        if(indiceActual >= imagenes.length){
            indiceActual = 0;
        }

        document.getElementById("imagenGrande").src =
            imagenes[indiceActual];

        document.getElementById("contadorFotos").textContent =
            `${indiceActual + 1} / ${imagenes.length}`;

    }

});

document.getElementById("visor").addEventListener("click", (evento) => {

    if(evento.target.id === "visor"){

        document.getElementById("visor")
            .classList.add("oculto");

    }

});

document.getElementById("imagenGrande").addEventListener("dblclick", () => {

    document.getElementById("visor")
        .classList.add("oculto");

});

document.getElementById("imagenGrande").addEventListener("wheel", (evento) => {

    evento.preventDefault();

    if(evento.deltaY < 0){

        zoom += 0.2;

    }else{

        zoom -= 0.2;

    }

    if(zoom < 1){
        zoom = 1;
    }

    if(zoom > 5){
        zoom = 5;
    }

    evento.target.style.transform = `scale(${zoom})`;

}, { passive:false });

document.getElementById("descargarFoto").addEventListener("click", () => {

    const enlace = document.createElement("a");

    enlace.href = imagenes[indiceActual];
    enlace.download = "";

    document.body.appendChild(enlace);

    enlace.click();

    enlace.remove();

});

document.getElementById("compartirFoto").addEventListener("click", async () => {

    const rutaActual = imagenes[indiceActual];

    const url = rutaActual.startsWith("http")
        ? rutaActual
        : new URL(rutaActual, window.location.href).href;

    if (navigator.share) {

        try {

            await navigator.share({
                title: "Capibaras Bancoppel",
                text: "Fotografía de la Galería Oficial",
                url: url
            });

        } catch (error) {
            console.error(error);
    }

    } else {

        navigator.clipboard.writeText(url);

        alert("Enlace copiado al portapapeles.");

    }

});