// filtros.js — Gestión de filtros y tabla de videojuegos con datos desde backend
// Carga datos vía AJAX con query params para filtros server-side

// Variables globales
let juegos = []; // Array de juegos cargados desde backend

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

  // IMPORTANTE: Ahora 'valoraciones' son datos reales de la BD (ValoracionPromedio)
  // Los triggers en la tabla Reseña calculan automáticamente el promedio
  // El backend ordena correctamente por valoraciones reales
  tablaBody.innerHTML = lista.map(j => `
    <tr class="fila-juego" data-juego='${JSON.stringify(j)}'>
      <td class="text-primary text-decoration-underline" style="cursor:pointer">${j.nombre}</td>
      <td>${j.fecha}</td>
      <td>${j.valoraciones}</td>
      <td>$${j.precio}</td>
    </tr>
  `).join("");

  // Agregar eventos de clic a cada fila para redirigir a detalle
  document.querySelectorAll(".fila-juego").forEach(fila => {
    fila.addEventListener("click", () => {
      const data = JSON.parse(fila.getAttribute("data-juego"));
      console.log(data);
      // Guardar en localStorage para página de detalle
      localStorage.setItem("juegoSeleccionado", JSON.stringify({
  id: data.id || data.IdVideojuego, // 🔥 FIX CLAVE
  nombre: data.nombre,
  precio: data.precio,
  valoraciones: data.valoraciones,
  etiqueta: data.genero ? [data.genero] : []
}));
      window.location.href = "detalle-videojuego.html";
    });
  });
}

// ---------------------------------------------------------------------
// APLICACIÓN DE FILTROS (ahora envía a backend)
// ---------------------------------------------------------------------
function aplicarFiltros() {
  // Construir query params para enviar al backend
  const params = new URLSearchParams();

  // Búsqueda por texto
  const texto = busquedaInput.value.trim();
  if (texto.length >= 1) {
    params.append('busqueda', texto);
  }

  // Rango de precio
  const minPrecio = parseInt(precioMin.value);
  const maxPrecio = parseInt(precioMax.value);
  params.append('minPrecio', minPrecio);
  params.append('maxPrecio', maxPrecio);

  // Filtros checkbox (solo si están seleccionados)
  const idiomas = obtenerSeleccionados(filtrosIdioma);
  if (idiomas.length) {
    params.append('idioma', idiomas.join(','));
  }

  const etiquetas = obtenerSeleccionados(filtrosEtiqueta);
  if (etiquetas.length) {
    params.append('genero', etiquetas.join(','));
  }

  const sistemas = obtenerSeleccionados(filtrosSO);
  if (sistemas.length) {
    params.append('so', sistemas.join(','));
  }

  // Orden
  params.append('orden', ordenSelect.value);

  // Fetch con query params
  // Las valoraciones ahora vienen reales de la DB (escala 0-100 desde tabla Reseña)
  fetch(`backend/videos.php?${params.toString()}`)
    .then(response => response.json())
    .then(data => {
      juegos = filtrarJuegosComprados(data); // Filtrar juegos comprados
      mostrarTabla(juegos);
    })
    .catch(err => {
      console.error('Error cargando juegos filtrados:', err);
      tablaBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar datos.</td></tr>';
    });
}

// ---------------------------------------------------------------------
// FUNCIONES AUXILIARES
// ---------------------------------------------------------------------

// Obtener valores seleccionados de checkboxes
const obtenerSeleccionados = (nodelist) =>
  [...nodelist].filter(x => x.checked).map(x => x.value);

// Obtener lista de juegos comprados desde localStorage
function obtenerJuegosComprados() {
  const comprados = localStorage.getItem('juegosComprados');
  return comprados ? JSON.parse(comprados) : [];
}

// Filtrar juegos comprados
function filtrarJuegosComprados(juegos) {
  const comprados = obtenerJuegosComprados();
  return juegos.filter(juego => !comprados.includes(juego.id));
}

// Actualizar spans de precio visual
function actualizarSpansPrecio() {
  minValorSpan.textContent = `$${precioMin.value}`;
  maxValorSpan.textContent = `$${precioMax.value}`;
}

// ---------------------------------------------------------------------
// EVENTOS DINÁMICOS
// ---------------------------------------------------------------------

// Debounce para búsqueda (evita llamadas excesivas)
let debounceTimer;
busquedaInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(aplicarFiltros, 200);
});

// Eventos para sliders de precio
precioMin.addEventListener("input", () => {
  actualizarSpansPrecio();
  aplicarFiltros();
});
precioMax.addEventListener("input", () => {
  actualizarSpansPrecio();
  aplicarFiltros();
});

// Evento para select de orden
ordenSelect.addEventListener("change", aplicarFiltros);

// Eventos para checkboxes de filtros
[filtrosIdioma, filtrosEtiqueta, filtrosSO].forEach(grupo =>
  grupo.forEach(chk =>
    chk.addEventListener("change", aplicarFiltros)
  )
);

// ---------------------------------------------------------------------
// INICIALIZACIÓN
// ---------------------------------------------------------------------

// Al cargar la página, inicializar y cargar datos
actualizarSpansPrecio();
aplicarFiltros(); // Primera carga sin filtros

