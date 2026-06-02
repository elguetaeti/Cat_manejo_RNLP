# Mapa Interactivo — Guía de uso

## Estructura de carpetas

```
mapa/
├── index.html              ← página principal
├── css/
│   └── style.css           ← todos los estilos (fuente, colores, panel)
├── js/
│   └── map.js              ← lógica del mapa (capas, leyenda, basemaps)
├── data/
│   ├── categorias.geojson  ← Capa 1: Categorías (polígonos rellenos)
│   └── subcategorias.geojson ← Capa 2: Subcategorías (líneas)
├── images/                 ← aquí van logos o imágenes opcionales
├── legend/                 ← carpeta para exportar leyenda si la necesitas separada
├── webfonts/               ← si descargas Century Gothic localmente va aquí
└── README.md               ← este archivo
```

---

## Cómo actualizar una capa

1. Reemplaza el archivo en `data/categorias.geojson` o `data/subcategorias.geojson`
2. Si cambian los valores del campo `Catgoría`, actualiza el objeto `CONFIG.categorias` o `CONFIG.subcategorias` en `js/map.js`

---

## Cómo cambiar colores

Abre `js/map.js` y edita el bloque `CONFIG` al inicio del archivo:

```js
categorias: {
  'Conservación':        { color: '#5BAA82', fill: '#7EC8A4', fillOpacity: 0.45 },
  'Preservación':        { color: '#4A8FB5', fill: '#7AB3D4', fillOpacity: 0.45 },
  ...
},
```

- `color` = color del borde
- `fill`  = color del relleno
- `fillOpacity` = transparencia del relleno (0 = invisible, 1 = sólido)

---

## Cómo cambiar el centro del mapa

En `js/map.js`, línea `CONFIG.centro`:

```js
centro: [18.22, -65.78],  // [latitud, longitud]
```

---

## Subir a GitHub + Netlify

### 1. GitHub
```bash
git init
git add .
git commit -m "Mapa inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 2. Netlify
1. Ve a [netlify.com](https://netlify.com) → **Add new site** → **Import an existing project**
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio
4. En **Build settings** deja todo en blanco (es un sitio estático)
5. Click **Deploy site** — listo ✅

Cada vez que hagas `git push`, Netlify actualiza el sitio automáticamente.

---

## Dependencias (CDN — sin instalar nada)

- [Leaflet 1.9.4](https://leafletjs.com/) — mapa interactivo
- Imágenes de fondo: OpenStreetMap, Esri World Imagery, Google Maps

---
