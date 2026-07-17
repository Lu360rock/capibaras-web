# 🏀 Capibaras Bancoppel | Galería Oficial 2026

Sitio web desarrollado para mostrar la galería oficial del equipo **Capibaras Bancoppel** durante los **Juegos Bancarios 2026**.

---

# Características

- Página principal con presentación del equipo.
- Carrusel automático de fotografías destacadas.
- Buscador de partidos por jornada, rival o fecha.
- Tarjetas dinámicas generadas desde `partidos.json`.
- Galerías independientes por partido.
- Visor de imágenes a pantalla completa.
- Navegación circular entre fotografías.
- Zoom mediante la rueda del mouse.
- Descarga de fotografías.
- Compartir fotografías.
- Contador de imágenes.
- Soporte para imágenes JPG, GIF y videos MP4.
- Generación automática de galerías mediante Node.js.
- Carga diferida de imágenes (*Lazy Loading*).
- Página personalizada de error 404.
- Diseño adaptable (Responsive Design).
- Iconografía SVG optimizada.

---

# Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript (ES6)
- JSON
- Node.js (script administrativo)

---

# Estructura del proyecto

```
capibaras-galeria/

├── admin/
│   └── generar-galeria.js
│
├── css/
│   └── style.css
│
├── datos/
│   ├── carrusel.json
│   └── partidos.json
│
├── img/
│   ├── hero/
│   ├── iconos/
│   ├── logo/
│   └── portadas/
│
├── js/
│   ├── app.js
│   ├── buscador.js
│   ├── carrusel.js
│   └── galeria.js
│
├── temporadas/
│   └── 2026/
│
├── index.html
├── galeria.html
├── 404.html
└── README.md
```

---

# Cómo ejecutar el proyecto

1. Abrir la carpeta del proyecto en Visual Studio Code.
2. Instalar la extensión **Live Server**.
3. Abrir `index.html` con Live Server.

---

# Agregar fotografías

1. Copiar las fotografías dentro de la carpeta correspondiente:

```
temporadas/2026/
```

2. Ejecutar:

```
node admin/generar-galeria.js
```

El script actualizará automáticamente:

- `galeria.json`
- `carrusel.json`
- `partidos.json`

---

## Generar las galerías

Después de agregar nuevas fotografías o videos ejecutar:

```bash
node admin/generar-galeria.js
```

Este proceso actualiza automáticamente:

- partidos.json
- carrusel.json
- galeria.json de cada jornada

---

## Optimización de imágenes

Las fotografías fueron exportadas desde Adobe Lightroom para uso web manteniendo alta calidad visual y reduciendo significativamente el tamaño del proyecto.

Las fotografías originales permanecen almacenadas por separado.

---


# Funcionalidades principales

- Carrusel automático.
- Buscador dinámico.
- Galerías independientes.
- Visor interactivo.
- Navegación circular.
- Lazy Loading.
- Compartir imágenes.
- Descargar imágenes.
- Responsive Design.
- Página 404 personalizada.

---

# Créditos

Desarrollado para:

**Capibaras Bancoppel**

Juegos Bancarios 2026.

---

## Navegación

### Inicio

- Carrusel automático
- Buscador
- Tarjetas por jornada

### Galería

- Abrir fotografías
- Navegación circular
- Zoom
- Descarga
- Compartir

---

# Licencia

Proyecto desarrollado para uso institucional y de difusión del equipo Capibaras Bancoppel.