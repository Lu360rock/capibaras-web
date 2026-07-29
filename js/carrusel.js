Promise.all([
    fetch(`datos/carrusel.json?v=2`).then(respuesta => respuesta.json()),
    fetch(`datos/drive-map.json?v=1`).then(respuesta => respuesta.json())
])
.then(([imagenes, drive]) => {

        const pista = document.getElementById("carruselPista");

        if (!pista) return;

        if (!imagenes.length) {

            pista.innerHTML = "<p>No hay fotografías disponibles.</p>";
            return;

        }

        const destacadas = imagenes
            .map(foto => {

                const partidoDrive = drive.partidos[String(foto.partido)];

                const archivo = foto.imagen.split("/").pop();

                const fotoDrive = partidoDrive?.imagenes.find(
                    imagen => imagen.archivo === archivo
                );

                return {
                    ...foto,
                    imagen: fotoDrive
                        ? fotoDrive.url.replace("&sz=w2000", "&sz=w600")
                        : foto.imagen
                };

            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 12);

        const todas = [...destacadas, ...destacadas];

        todas.forEach(foto => {

            const enlace = document.createElement("a");

            enlace.href = `galeria.html?partido=${foto.partido}`;

            enlace.className = "miniatura";

            enlace.innerHTML = `
                <img
                    src="${foto.imagen}"
                    alt="Fotografía destacada de Capibaras Bancoppel"
                    loading="lazy">
            `;

            pista.appendChild(enlace);

        });

        let posicion = 0;
        let ancho = pista.scrollWidth / 2;
        let pausa = false;

        function animar(){

            if(!pausa){

                posicion++;

                if(posicion >= ancho){

                    posicion = 0;

                }

                pista.style.transform =
                    `translateX(-${posicion}px)`;

            }

            requestAnimationFrame(animar);

        }

        requestAnimationFrame(animar);

        pista.addEventListener("mouseenter", () => pausa = true);

        pista.addEventListener("mouseleave", () => pausa = false);

    })
    .catch(console.error);