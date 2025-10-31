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
    `<b>${c.nombre}</b>`
  ); // Popup con detalle del centro
  marker.tipo = "fijo";
  marker.nombre = c.nombre;
  marcadores.push(marker);
  grupoFijos.addLayer(marker);
});

// Marcadores de centros móviles
centrosMoviles.forEach((m) => {
  const marker = L.marker(m.coords, { icon: iconoMovil }).bindPopup(
    `<b>${m.nombre}</b>`
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

    const seccionInfo = document.createElement("div");
    seccionInfo.classList.add("infoCentro");

    const infoDetalle = document.createElement("span")
    infoDetalle.textContent = item.detalle;

    const separar = document.createElement("br");

    const infoHorario = document.createElement("span");
    infoHorario.textContent = item.horario;
    
    const botonUbi = document.createElement("div");
    botonUbi.classList.add("botonUbicacion");

    const infoUbicacion= document.createElement("button");
    infoUbicacion.classList.add("verUbicacion");
    infoUbicacion.textContent = "Ver Ubicacion";

    seccionInfo.appendChild(infoDetalle);
    seccionInfo.appendChild(separar);
    seccionInfo.appendChild(infoHorario);
    seccionInfo.appendChild(botonUbi);
    botonUbi.appendChild(infoUbicacion);

    li.appendChild(seccionInfo);

    li.addEventListener("click", () => seleccionarCentro(item, i));
    infoUbicacion.addEventListener("click", (e) =>{
                                    e.stopPropagation(); 
                                    botonUbicacion(item,i)});
                                    
    lista.appendChild(li);
  });
};

renderLista([...centrosFijos, ...centrosMoviles]);

// --- SELECCION DEL CENTRO DESDE PANEL LATERAL ---
const seleccionarCentro = (centro, index) => {

  // Seteo en el panel el centro seleccionado
  document
    .querySelectorAll("#lista-centros li")
    .forEach((li) => {
      li.classList.remove("activo")
    });
  document.querySelectorAll("#lista-centros li")[index].classList.toggle("activo");
  document.querySelectorAll("#lista-centros li")[index].classList.toggle("expande");
  document
    .querySelectorAll(".filtros button")
    .forEach((b) => b.classList.remove("activo"));

};

// --- BOTON PARA VER LA UBICACION DEL CENTRO ---
const botonUbicacion = (centro, index) => {
  map.setView(centro.coords,15);
  const marker = marcadores.find(
    (m) =>
      m.getLatLng().lat === centro.coords[0] &&
      m.getLatLng().lng === centro.coords[1]
  );
  if (marker) {
    marker.openPopup();
  }
  document.querySelectorAll("#lista-centros li")[index].classList.add("activo");
}

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
      liSeleccionado.classList.toggle("activo");
      liSeleccionado.classList.toggle("expande");
      liSeleccionado.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    document
      .querySelectorAll(".filtros button")
      .forEach((b) => b.classList.remove("activo"));
  });
});

// --- BUSCADOR ---
const busqueda = () =>{
  const centroIngresado = document.getElementById("busquedaCentro");
  const todosLosCentros=[...centrosFijos, ...centrosMoviles];
  const centroElegido= centroIngresado.value.trim();

  const centrosCoincidentesBusqueda = todosLosCentros.filter(c => {
    return c.nombre.toLowerCase().includes(centroElegido.toLowerCase());
  })
  renderLista(centrosCoincidentesBusqueda);
  map.addLayer(centrosCoincidentesBusqueda);

}
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
document.getElementById("buscar").addEventListener("click", busqueda);
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
