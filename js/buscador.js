const buscador = document.getElementById("buscarPartido");

buscador.addEventListener("input", () => {

    const texto = buscador.value.toLowerCase().trim();

    document.querySelectorAll(".tarjeta").forEach(tarjeta => {

        const contenido = tarjeta.textContent.toLowerCase();

        tarjeta.style.display =
            contenido.includes(texto) ? "" : "none";

    });

});