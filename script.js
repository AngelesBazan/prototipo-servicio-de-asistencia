import { centrosFijos, centrosMoviles } from "./data.js";

// Inicializar el mapa
const map = L.map("map").setView([-34.6037, -58.3816], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// Crea grupo de marcadores
const grupoFijos = L.layerGroup();
const grupoMoviles = L.layerGroup();
const marcadores = [];
let listaActual = []; // Lista visible en el panel lateral

const iconoFijo = L.icon({
  iconUrl: "./house.png",
  iconSize: [30, 30],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const iconoMovil = L.icon({
  iconUrl: "./bus.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

// Marcadores de centros fijos
centrosFijos.forEach((c) => {
  const marker = L.marker(c.coords, { icon: iconoFijo }).bindPopup(
    `<b>${c.nombre}</b><br>${c.detalle}<br>${c.horario}`
  ); // Popup con detalle del centro
  marker.tipo = "fijo";
  marker.nombre = c.nombre;
  marcadores.push(marker);
  grupoFijos.addLayer(marker);
});

// Marcadores de centros móviles
centrosMoviles.forEach((m) => {
  const marker = L.marker(m.coords, { icon: iconoMovil }).bindPopup(
    `<b>${m.nombre}</b><br>${m.detalle}<br>${m.horario}`
  );
  marker.tipo = "movil";
  marker.nombre = m.nombre;
  marcadores.push(marker);
  grupoMoviles.addLayer(marker);
});

// Muestra todos los centros por defecto
grupoFijos.addTo(map);
grupoMoviles.addTo(map);
restaurarVista(map, [grupoFijos, grupoMoviles]);

// --- PANEL LATERAL ---
const lista = document.getElementById("lista-centros");

const renderLista = (items) => {
  lista.innerHTML = "";
  listaActual = items;
  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = item.nombre;
    li.addEventListener("click", () => seleccionarCentro(item, i));
    lista.appendChild(li);
  });
};

renderLista([...centrosFijos, ...centrosMoviles]);

// --- SELECCION DEL CENTRO DESDE PANEL LATERAL ---
const seleccionarCentro = (centro, index) => {
  // Centrar mapa
  map.setView(centro.coords, 15);

  // Abrir popup
  const marker = marcadores.find(
    (m) =>
      m.getLatLng().lat === centro.coords[0] &&
      m.getLatLng().lng === centro.coords[1]
  );
  if (marker) {
    marker.openPopup();
  }

  // Seteo en el panel el centro seleccionado
  document
    .querySelectorAll("#lista-centros li")
    .forEach((li) => li.classList.remove("activo"));
  document.querySelectorAll("#lista-centros li")[index].classList.add("activo");

  document
    .querySelectorAll(".filtros button")
    .forEach((b) => b.classList.remove("activo"));
};

// --- SELECCION DESDE EL MAPA ---
marcadores.forEach((marker) => {
  marker.on("click", () => {
    const index = listaActual.findIndex((c) => c.nombre === marker.nombre);
    if (index !== -1) {
      document
        .querySelectorAll("#lista-centros li")
        .forEach((li) => li.classList.remove("activo"));
      const liSeleccionado =
        document.querySelectorAll("#lista-centros li")[index];
      liSeleccionado.classList.add("activo");
      liSeleccionado.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    document
      .querySelectorAll(".filtros button")
      .forEach((b) => b.classList.remove("activo"));
  });
});

// --- BOTONES FILTROS ---
const mostrarFijos = () => {
  map.removeLayer(grupoMoviles);
  map.addLayer(grupoFijos);
  renderLista(centrosFijos);
  activarBoton("btnFijos");
  restaurarVista(map, [grupoFijos]);
}

const mostrarMoviles = () => {
  map.removeLayer(grupoFijos);
  map.addLayer(grupoMoviles);
  renderLista(centrosMoviles);
  activarBoton("btnMoviles");
  restaurarVista(map, [grupoMoviles]);
}

const mostrarTodos = () => {
  map.addLayer(grupoFijos);
  map.addLayer(grupoMoviles);
  renderLista([...centrosFijos, ...centrosMoviles]);
  activarBoton("btnTodos");
  restaurarVista(map, [grupoFijos, grupoMoviles]);
}

// --- EVENTOS DE BOTONES ---
document.getElementById("btnFijos").addEventListener("click", mostrarFijos);
document.getElementById("btnMoviles").addEventListener("click", mostrarMoviles);
document.getElementById("btnTodos").addEventListener("click", mostrarTodos);

// --- BOTÓN ACTIVO ---
const activarBoton = (id) => {
  document
    .querySelectorAll(".filtros button")
    .forEach((b) => b.classList.remove("activo"));
  document.getElementById(id).classList.add("activo");
}

// --- FUNCIÓN PARA RESTAURAR ZOOM ---
function restaurarVista(map, grupos) {
  const bounds = L.latLngBounds();
  grupos.forEach((g) => {
    if (map.hasLayer(g)) {
      g.eachLayer((layer) => bounds.extend(layer.getLatLng()));
    }
  });

  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [30, 30] });
  } else {
    map.setView([-34.6037, -58.3816], 12);
  }
}
