// filtros.js — VERSIÓN MEJORADA Y OPTIMIZADA
//--------------------------------------------

// Datos de ejemplo (pueden venir de una API en el futuro)
const juegos = [
  {
    nombre: "Hollow Knight",
    fecha: "2017-02-24",
    valoraciones: 94,
    precio: 15,
    idioma: ["español", "ingles"],
    etiqueta: ["indie", "accion"],
    so: ["windows", "linux", "macos"]
  },
  {
    nombre: "Stardew Valley",
    fecha: "2016-02-26",
    valoraciones: 92,
    precio: 10,
    idioma: ["español", "ingles", "portugues"],
    etiqueta: ["casual", "indie"],
    so: ["windows", "linux", "macos"]
  },
  {
    nombre: "Counter Strike 2",
    fecha: "2023-09-27",
    valoraciones: 88,
    precio: 0,
    idioma: ["español", "ingles", "portugues"],
    etiqueta: ["accion"],
    so: ["windows"]
  }
];

// Elementos del DOM
const tablaBody = document.getElementById("tablaResultados");
const busquedaInput = document.getElementById("buscarJuego");

const precioMin = document.getElementById("precioMin");
const precioMax = document.getElementById("precioMax");

const minValorSpan = document.getElementById("minValor");
const maxValorSpan = document.getElementById("maxValor");

const ordenSelect = document.getElementById("ordenar");

const filtrosIdioma = document.querySelectorAll("input[name='idioma']");
const filtrosEtiqueta = document.querySelectorAll("input[name='etiqueta']");
const filtrosSO = document.querySelectorAll("input[name='so']");

// ---------------------------------------------------------------------
// RENDERIZAR TABLA
// ---------------------------------------------------------------------
function mostrarTabla(lista) {
  tablaBody.innerHTML = "";

  if (!lista.length) {
    tablaBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted">No se encontraron resultados.</td>
      </tr>
    `;
    return;
  }

  tablaBody.innerHTML = lista.map(j => `
  <tr class="fila-juego" data-juego='${JSON.stringify(j)}'>
    <td class="text-primary text-decoration-underline" style="cursor:pointer">${j.nombre}</td>
    <td>${j.fecha}</td>
    <td>${j.valoraciones}</td>
    <td>$${j.precio}</td>
  </tr>
`).join("");

// Agregar eventos a cada fila
document.querySelectorAll(".fila-juego").forEach(fila => {
  fila.addEventListener("click", () => {
    const data = JSON.parse(fila.getAttribute("data-juego"));

    // Guardar en localStorage
    localStorage.setItem("juegoSeleccionado", JSON.stringify(data));

    // Redirigir
    window.location.href = "detalle-videojuego.html";
  });
});

}

// Obtener valores seleccionados de un grupo de checkboxes
const obtenerSeleccionados = (nodelist) =>
  [...nodelist].filter(x => x.checked).map(x => x.value);

// ---------------------------------------------------------------------
// APLICACIÓN DE FILTROS
// ---------------------------------------------------------------------
function aplicarFiltros() {
  let resultados = [...juegos];

  // --- Filtro por texto ---
  const texto = busquedaInput.value.toLowerCase();
  if (texto.length >= 1) {
    resultados = resultados.filter(j =>
      j.nombre.toLowerCase().includes(texto)
    );
  }

  // --- Filtro por precio ---
  const precioMinimo = parseInt(precioMin.value);
  const precioMaximo = parseInt(precioMax.value);

  resultados = resultados.filter(j =>
    j.precio >= precioMinimo && j.precio <= precioMaximo
  );

  // --- Filtros checkbox ---
  const idiomas = obtenerSeleccionados(filtrosIdioma);
  const etiquetas = obtenerSeleccionados(filtrosEtiqueta);
  const sistemas = obtenerSeleccionados(filtrosSO);

  if (idiomas.length)
    resultados = resultados.filter(j =>
      idiomas.some(i => j.idioma.includes(i))
    );

  if (etiquetas.length)
    resultados = resultados.filter(j =>
      etiquetas.some(t => j.etiqueta.includes(t))
    );

  if (sistemas.length)
    resultados = resultados.filter(j =>
      sistemas.some(s => j.so.includes(s))
    );

  // --- Ordenar ---
  switch (ordenSelect.value) {
    case "precio":
      resultados.sort((a, b) => a.precio - b.precio);
      break;
    case "fecha":
      resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      break;
    case "valoraciones":
      resultados.sort((a, b) => b.valoraciones - a.valoraciones);
      break;
    default: // nombre
      resultados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  mostrarTabla(resultados);
}

// ---------------------------------------------------------------------
// Ajustar visual de rango de precio
// ---------------------------------------------------------------------
function actualizarSpansPrecio() {
  minValorSpan.textContent = `$${precioMin.value}`;
  maxValorSpan.textContent = `$${precioMax.value}`;
}

// ---------------------------------------------------------------------
// EVENTOS DINÁMICOS
// ---------------------------------------------------------------------

// Tener mejores rendimiento: small debounce al buscar
let debounceTimer;
busquedaInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(aplicarFiltros, 200);
});

precioMin.addEventListener("input", () => {
  actualizarSpansPrecio();
  aplicarFiltros();
});

precioMax.addEventListener("input", () => {
  actualizarSpansPrecio();
  aplicarFiltros();
});

ordenSelect.addEventListener("change", aplicarFiltros);

[filtrosIdioma, filtrosEtiqueta, filtrosSO].forEach(grupo =>
  grupo.forEach(chk =>
    chk.addEventListener("change", aplicarFiltros)
  )
);

// Mostrar al cargar
actualizarSpansPrecio();
aplicarFiltros();
