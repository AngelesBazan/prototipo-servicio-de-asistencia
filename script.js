import { centrosFijos, centrosMoviles } from "./data.js";

const map = L.map("map").setView([-34.6037, -58.3816], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const grupoFijos = L.layerGroup();
const grupoMoviles = L.layerGroup();
const marcadores = [];
let listaActual = [];

const iconoFijo = L.icon({
  iconUrl: "./house.png",
  iconSize: [25, 25],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

const iconoMovil = L.icon({
  iconUrl: "./bus.png",
  iconSize: [25, 25],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

centrosFijos.forEach((c) => {
  const marker = L.marker(c.coords, { icon: iconoFijo }).bindPopup(
    `<b>${c.nombre}</b>`
  );
  marker.tipo = "fijo";
  marker.nombre = c.nombre;
  marcadores.push(marker);
  grupoFijos.addLayer(marker);
});

centrosMoviles.forEach((m) => {
  const marker = L.marker(m.coords, { icon: iconoMovil }).bindPopup(
    `<b>${m.nombre}</b>`
  );
  marker.tipo = "movil";
  marker.nombre = m.nombre;
  marcadores.push(marker);
  grupoMoviles.addLayer(marker);
});

grupoFijos.addTo(map);
grupoMoviles.addTo(map);
restaurarVista(map, [grupoFijos, grupoMoviles]);

const lista = document.getElementById("lista-centros");
const renderLista = (items) => {
  lista.innerHTML = "";
  listaActual = items;
  items.forEach((item, i) => {
    const li = document.createElement("li");
    const seccionInfo = document.createElement("div");
    const infoDetalle = document.createElement("span");
    const separar = document.createElement("br");
    const infoHorario = document.createElement("span");
    const botonUbi = document.createElement("div");
    const infoUbicacion = document.createElement("button");

    li.textContent = item.nombre;
    infoDetalle.textContent = item.detalle;
    infoHorario.textContent = item.horario;
    infoUbicacion.textContent = "Ver Ubicación";

    seccionInfo.classList.add("infoCentro");
    botonUbi.classList.add("botonUbicacion");
    infoUbicacion.classList.add("verUbicacion");

    seccionInfo.appendChild(infoDetalle);
    seccionInfo.appendChild(separar);
    seccionInfo.appendChild(infoHorario);
    seccionInfo.appendChild(botonUbi);
    botonUbi.appendChild(infoUbicacion);
    li.appendChild(seccionInfo);
    lista.appendChild(li);

    li.addEventListener("click", () => seleccionarCentro(item, i));
    infoUbicacion.addEventListener("click", (e) => {
      e.stopPropagation();
      botonUbicacion(item, i);
    });
  });
};

renderLista([...centrosFijos, ...centrosMoviles]);

const seleccionarCentro = (centro, index) => {
  document.querySelectorAll("#lista-centros li").forEach((li) => {
    li.classList.remove("activo");
    li.classList.remove("expande");
  });
  document
    .querySelectorAll("#lista-centros li")
    [index].classList.toggle("activo");
  document
    .querySelectorAll("#lista-centros li")
    [index].classList.toggle("expande");
  document
    .querySelectorAll(".filtros button")
    .forEach((b) => b.classList.remove("activo"));
};

const botonUbicacion = (centro, index) => {
  map.setView(centro.coords, 15);
  const marker = marcadores.find(
    (m) =>
      m.getLatLng().lat === centro.coords[0] &&
      m.getLatLng().lng === centro.coords[1]
  );

  if (marker) {
    marker.openPopup();
  }
  document.querySelectorAll("#lista-centros li")[index].classList.add("activo");
};

marcadores.forEach((marker) => {
  marker.on("click", () => {
    map.setView(marker.getLatLng(), 15);
    const index = listaActual.findIndex((c) => c.nombre === marker.nombre);
    if (index !== -1) {
      document.querySelectorAll("#lista-centros li").forEach((li) => {
        li.classList.remove("activo");
        li.classList.remove("expande");
      });
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

const busqueda = () => {
  const centroIngresado = document.getElementById("busquedaCentro");
  const todosLosCentros = [...centrosFijos, ...centrosMoviles];
  const centroElegido = centroIngresado.value.trim();

  const centrosCoincidentesBusqueda = todosLosCentros.filter((c) => {
    return c.nombre.toLowerCase().includes(centroElegido.toLowerCase());
  });
  renderLista(centrosCoincidentesBusqueda);

  map.removeLayer(grupoFijos);
  map.removeLayer(grupoMoviles);
  let grupoBusqueda = L.layerGroup();

  const nombresCoincidentes = centrosCoincidentesBusqueda.map((c) => c.nombre);

  const marcadoresCoincidentes = marcadores.filter((m) => {
    return nombresCoincidentes.includes(m.nombre);
  });
  grupoBusqueda = L.layerGroup(marcadoresCoincidentes);
  grupoBusqueda.addTo(map);
  restaurarVista(map, [grupoBusqueda]);
};

const inputBusqueda = document.getElementById("busquedaCentro");

inputBusqueda.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    busqueda();
  }
});

inputBusqueda.addEventListener("input", () => {
  if (inputBusqueda.value.trim() === "") {
    mostrarTodos();
  }
});

const mostrarFijos = () => {
  map.closePopup();
  map.removeLayer(grupoMoviles);
  map.addLayer(grupoFijos);
  renderLista(centrosFijos);
  activarBoton("btnFijos");
  restaurarVista(map, [grupoFijos]);
};

const mostrarMoviles = () => {
  map.closePopup();
  map.removeLayer(grupoFijos);
  map.addLayer(grupoMoviles);
  renderLista(centrosMoviles);
  activarBoton("btnMoviles");
  restaurarVista(map, [grupoMoviles]);
};

const mostrarTodos = () => {
  map.closePopup();
  map.addLayer(grupoFijos);
  map.addLayer(grupoMoviles);
  renderLista([...centrosFijos, ...centrosMoviles]);
  activarBoton("btnTodos");
  restaurarVista(map, [grupoFijos, grupoMoviles]);
};

document.getElementById("buscar").addEventListener("click", busqueda);
document.getElementById("btnFijos").addEventListener("click", mostrarFijos);
document.getElementById("btnMoviles").addEventListener("click", mostrarMoviles);
document.getElementById("btnTodos").addEventListener("click", mostrarTodos);

const activarBoton = (id) => {
  document
    .querySelectorAll(".filtros button")
    .forEach((b) => b.classList.remove("activo"));
  document.getElementById(id).classList.add("activo");
};

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
