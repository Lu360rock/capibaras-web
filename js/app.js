document.addEventListener("DOMContentLoaded", () => {

    const contenedor = document.getElementById("contenedor-partidos");

    if (!contenedor) return;

    fetch("datos/partidos.json?v=2026")
        .then(respuesta => respuesta.json())
        .then(partidos => {

            contenedor.innerHTML = "";

            partidos.forEach(partido => {

                const tarjeta = document.createElement("article");

                tarjeta.className = "tarjeta";

                tarjeta.innerHTML = `
                    <img
                        class="portada-partido"
                        src="${partido.portada}"
                        loading="lazy"
                        alt="Portada del partido ${partido.jornada} contra ${partido.rival}"

                    <div class="contenido-tarjeta">

                        <h3>${partido.jornada}</h3>

                        <p><strong>Rival:</strong> ${partido.rival}</p>

                        <p><strong>Fecha:</strong> ${partido.fecha}</p>

                        <p><strong>Lugar:</strong> ${partido.lugar}</p>

                        <p><strong>Resultado:</strong> ${partido.resultado}</p>

                        <p><strong>Fotografías:</strong> ${partido.totalFotos ?? 0}</p>

                        ${partido.totalFotos > 0
                            ? `
                                <a
                                    class="boton abrir-galeria"
                                    href="galeria.html?partido=${partido.id}">
                                    Abrir galería
                                </a>
                              `
                            : `
                                <button
                                    class="boton abrir-galeria"
                                    disabled>
                                    Próximamente
                                </button>
                            `
                       }

                    </div>
                `;

                contenedor.appendChild(tarjeta);

            });

        })
        .catch(error => {

            console.error(error);

            contenedor.innerHTML = `
                <p>
                    No fue posible cargar la temporada.
                    Intenta actualizar la página.
                </p>
            `;

        });

});