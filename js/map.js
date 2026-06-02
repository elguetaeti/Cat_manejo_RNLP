/* ============================================
   MAPA INTERACTIVO - map.js
   Capas: Categorías (relleno) + Subcategorías (líneas)
   Mapas base: OSM, Satelital (Esri), Google Maps
   ============================================ */

// ── CONFIGURACIÓN FÁCIL DE EDITAR ────────────
const CONFIG = {
  centro: [17.95, -67.03],   // [latitud, longitud] — ajusta al centro de tus datos
  zoom: 13,
  minZoom: 8,
  maxZoom: 19,

  // Colores de Categorías (relleno pastel semitransparente)
  categorias: {
    'Conservación':       { color: '#5BAA82', fill: '#7EC8A4', fillOpacity: 0.45 },
    'Preservación':       { color: '#006666', fill: '#fbff01', fillOpacity: 0.45 },
    'Restauración':       { color: '#C87830', fill: '#F4A96A', fillOpacity: 0.45 },
    'Transición ecológica':{ color: '#9B6DB5', fill: '#C39BD3', fillOpacity: 0.6 },
  },

  // Colores de Subcategorías (línea + relleno casi invisible)
  subcategorias: {
    'Conservación - Bañistas':   { color: '#E05C8A', dashArray: '8 4',  fillOpacity: 0.8 },
    'Conservación - NWZ':{ color: '#C07800', dashArray: '4 4',  fillOpacity: 0.3 },
    'Conservación - No Anclaje': { color: '#2A9AA8', dashArray: '12 4', fillOpacity: 0.12 },
  },

  // Peso de líneas
  weightCategorias:    1.5,
  weightSubcategorias: 2.2,
};
// ─────────────────────────────────────────────


// ── INICIALIZAR MAPA ─────────────────────────
const map = L.map('map', {
  center: CONFIG.centro,
  zoom:   CONFIG.zoom,
  minZoom: CONFIG.minZoom,
  maxZoom: CONFIG.maxZoom,
  zoomControl: true,
});

map.zoomControl.setPosition('bottomleft');


// ── MAPAS BASE ───────────────────────────────
const basemaps = {
  osm: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19 }
  ),

  satelite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: '© Esri, Maxar, Earthstar Geographics', maxZoom: 19 }
  ),
  esri_hybrid: L.layerGroup([
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, attribution: '© Esri, Maxar, Earthstar Geographics' }
  ),

  L.tileLayer(
    'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 19, attribution: '© Esri' }
  )
]),  
};

// Mapa base inicial
basemaps.satelite.addTo(map);
let activeBasemap = 'satelite';


// ── CAPAS GEOJSON ────────────────────────────
let layerCategorias    = null;
let layerSubcategorias = null;
let layerlaparguera = null;

// Estado de visibilidad por valor único
const visibilidadCategorias    = {};
const visibilidadSubcategorias = {};

// Inicializar estados
Object.keys(CONFIG.categorias).forEach(k    => visibilidadCategorias[k]    = true);
Object.keys(CONFIG.subcategorias).forEach(k => visibilidadSubcategorias[k] = true);

// Estado de visibilidad de grupos completos
let grupoCatVisible = true;
let grupoSubVisible = true;


// Función de estilo para Categorías
function estiloCategorias(feature) {
  const cat = feature.properties['Catgoría'] || '';
  const cfg = CONFIG.categorias[cat] || { color: '#999', fill: '#ccc', fillOpacity: 0.6 };
  return {
    color:       cfg.color,
    weight:      CONFIG.weightCategorias,
    fillColor:   cfg.fill,
    fillOpacity: visibilidadCategorias[cat] ? cfg.fillOpacity : 0,
    opacity:     visibilidadCategorias[cat] ? 1 : 0,
  };
}

// Función de estilo para Subcategorías
function estiloSubcategorias(feature) {
  const cat = feature.properties['Catgoría'] || '';
  const cfg = CONFIG.subcategorias[cat] || { color: '#555', dashArray: '6 3', fillOpacity: 0.1 };
  return {
    color:       cfg.color,
    weight:      CONFIG.weightSubcategorias,
    dashArray:   cfg.dashArray,
    fillColor:   cfg.color,
    fillOpacity: visibilidadSubcategorias[cat] ? cfg.fillOpacity : 0,
    opacity:     visibilidadSubcategorias[cat] ? 1 : 0,
    lineCap:     'round',
    lineJoin:    'round',
  };
}

// Popup al hacer clic (SIN mouseover)
function onEachCategorias(feature, layer) {
  const cat = feature.properties['Catgoría'] || 'Sin categoría';
  layer.bindPopup(`
    <div class="popup-title">📂 Categoría</div>
    <div class="popup-sub">${cat}</div>
  `);
  // ❌ Eliminados los eventos mouseover y mouseout
}

// Popup al hacer clic para Subcategorías (SIN mouseover)
function onEachSubcategorias(feature, layer) {
  const cat = feature.properties['Catgoría'] || 'Sin subcategoría';
  layer.bindPopup(`
    <div class="popup-title">🗂 Subcategoría</div>
    <div class="popup-sub">${cat}</div>
  `);
  // ❌ Eliminados los eventos mouseover y mouseout
}

// Cargar Categorías
fetch('data/categorias.geojson')
  .then(r => r.json())
  .then(data => {
    layerCategorias = L.geoJSON(data, {
      style: estiloCategorias,
      onEachFeature: onEachCategorias,
    }).addTo(map);

    // Ajustar vista al contenido
    if (map.getZoom() <= CONFIG.zoom) {
      map.fitBounds(layerCategorias.getBounds(), { padding: [20, 20] });
    }
  })
  .catch(err => console.error('Error cargando categorias.geojson:', err));

// Cargar Subcategorías (encima)
fetch('data/subcategorias.geojson')
  .then(r => r.json())
  .then(data => {
    layerSubcategorias = L.geoJSON(data, {
      style: estiloSubcategorias,
      onEachFeature: onEachSubcategorias,
    }).addTo(map);
  })
  .catch(err => console.error('Error cargando subcategorias.geojson:', err));

  // Cargar límites de La Parguera
fetch('data/laparguera.geojson')
.then(r => r.json())
.then(data => {

    Parguera = L.geoJSON(data, {

        style: {
            color: '#ff0202',
            weight: 1,
            fill: false,
            fillOpacity: 0
        }

     
    }).addTo(map);
    Parguera.bringToFront();

    console.log('Nueva capa cargada');

});

// ── LEYENDA ──────────────────────────────────
function buildLeyenda() {
  const body = document.getElementById('legend-body');
  body.innerHTML = '';
  // — Parguera (límites) —
const itemP = document.createElement('div');
itemP.className = 'legend-item';

itemP.innerHTML = `
  <span style="
    width:20px;
    height:3px;
    background:#ff0202;
    display:inline-block;
  "></span>

  <span>Límites RN La Parguera</span>
`;

body.appendChild(itemP);

  // — Grupo: Categorías —
  const tituloC = document.createElement('div');
  tituloC.className = 'legend-group-title';
  tituloC.textContent = 'Categorías';
  body.appendChild(tituloC);

  Object.entries(CONFIG.categorias).forEach(([nombre, cfg]) => {
    const item = document.createElement('div');
    item.className = 'legend-item' + (visibilidadCategorias[nombre] ? '' : ' hidden');
    item.dataset.tipo  = 'categoria';
    item.dataset.valor = nombre;

    item.innerHTML = `
      <div class="swatch-fill" style="background:${cfg.fill}; border-color:${cfg.color};"></div>
      <span class="legend-label">${nombre}</span>
    `;
    item.addEventListener('click', () => toggleCategoria(nombre, item));
    body.appendChild(item);
  });

  // — Grupo: Subcategorías —
  const tituloS = document.createElement('div');
  tituloS.className = 'legend-group-title';
  tituloS.style.marginTop = '14px';
  tituloS.textContent = 'Subcategorías';
  body.appendChild(tituloS);
  

  Object.entries(CONFIG.subcategorias).forEach(([nombre, cfg]) => {
    const item = document.createElement('div');
    item.className = 'legend-item' + (visibilidadSubcategorias[nombre] ? '' : ' hidden');
    item.dataset.tipo  = 'subcategoria';
    item.dataset.valor = nombre;

    // SVG de línea punteada
    const dash = cfg.dashArray.replace(' ', ',');
    const svg  = `<svg viewBox="0 0 22 16" xmlns="http://www.w3.org/2000/svg">
      <line x1="1" y1="8" x2="21" y2="8"
        stroke="${cfg.color}" stroke-width="2.5"
        stroke-dasharray="${dash}" stroke-linecap="round"/>
    </svg>`;

    item.innerHTML = `
      <div class="swatch-line">${svg}</div>
      <span class="legend-label">${nombre}</span>
    `;
    item.addEventListener('click', () => toggleSubcategoria(nombre, item));
    body.appendChild(item);
  });
  
}

// Toggle capa Categoría individual
function toggleCategoria(nombre, itemEl) {
  visibilidadCategorias[nombre] = !visibilidadCategorias[nombre];
  itemEl.classList.toggle('hidden');
  if (layerCategorias) {
    layerCategorias.eachLayer(l => {
      if (l.feature.properties['Catgoría'] === nombre) {
        l.setStyle(estiloCategorias(l.feature));
      }
    });
  }
}

// Toggle capa Subcategoría individual
function toggleSubcategoria(nombre, itemEl) {
  visibilidadSubcategorias[nombre] = !visibilidadSubcategorias[nombre];
  itemEl.classList.toggle('hidden');
  if (layerSubcategorias) {
    layerSubcategorias.eachLayer(l => {
      if (l.feature.properties['Catgoría'] === nombre) {
        l.setStyle(estiloSubcategorias(l.feature));
      }
    });
  }
}

// Colapsar/expandir leyenda
document.getElementById('legend-toggle').addEventListener('click', () => {
  const body = document.getElementById('legend-body');
  const btn  = document.getElementById('legend-toggle');
  body.classList.toggle('collapsed');
  btn.textContent = body.classList.contains('collapsed') ? '▲' : '▼';
});

// ── SELECTOR MAPA BASE ────────────────────────
document.querySelectorAll('.basemap-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.basemap;
    if (id === activeBasemap) return;

    // Quitar actual
    Object.values(basemaps).forEach(bl => {
      if (map.hasLayer(bl)) map.removeLayer(bl);
    });

    // Añadir nuevo debajo de las capas GeoJSON
    basemaps[id].addTo(map);
    if (layerCategorias)    layerCategorias.bringToFront();
    if (layerSubcategorias) layerSubcategorias.bringToFront();

    activeBasemap = id;
    document.querySelectorAll('.basemap-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Construir leyenda al cargar
buildLeyenda();

