// accesibilidad.js (versión corregida - maneja fondos inline y restore)
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("accessibility-btn");
  const menuOptions = document.getElementById("accessibility-options");
  const contrastBtn = document.getElementById("toggle-contrast");
  const increaseFontBtn = document.getElementById("increase-font");
  const decreaseFontBtn = document.getElementById("decrease-font");

  // --- Mostrar / ocultar menú ---
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menuOptions.classList.toggle("show");
  });

  // Cerrar si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (!menuOptions.contains(e.target) && e.target !== menuBtn) {
      menuOptions.classList.remove("show");
    }
  });

  // --- Control de tamaño de fuente ---
  let fontSize = 100;
  increaseFontBtn.addEventListener("click", () => {
    if (fontSize < 150) {
      fontSize += 10;
      document.body.style.fontSize = `${fontSize}%`;
    }
  });
  decreaseFontBtn.addEventListener("click", () => {
    if (fontSize > 80) {
      fontSize -= 10;
      document.body.style.fontSize = `${fontSize}%`;
    }
  });

  // --- Modo oscuro / claro (mejorado para fondos inline) ---
  const DARK_BG = "#1a1a1a";      // fondo oscuro general
  const DARK_PANEL_BG = "#2b2b2b"; // fondo para paneles (cards)
  const DARK_TEXT = "#f2f2f2";

  // elementos a considerar para override de fondo si tienen fondo inline o computed bg
  const panelSelectors = [
    ".login-box", ".register-box", ".footer",
    ".table-container", ".filters-container",
    ".p-4", ".shadow", ".rounded", ".table-responsive", ".filter-box"
  ];

  // función que detecta elementos con fondo no transparente dentro del área principal
  function collectElementsToOverride() {
    const elems = new Set();

    // 1) Agregar elementos que coinciden con panelSelectors
    panelSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => elems.add(el));
    });

    // 2) Agregar elementos que tienen estilo inline con 'background' o 'background-color'
    document.querySelectorAll("[style]").forEach(el => {
      const s = el.getAttribute("style") || "";
      if (/background(-color)?\s*:/.test(s)) elems.add(el);
    });

    // 3) Agregar elementos cuyo computedStyle backgroundColor no sea transparente
    document.querySelectorAll("body *").forEach(el => {
      try {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg && bg !== "transparent" && !bg.startsWith("rgba(0, 0, 0, 0)")) {
          // evitar añadir body y html
          if (el !== document.body && el !== document.documentElement) elems.add(el);
        }
      } catch (e) {
        // algunos elementos pueden lanzar en getComputedStyle en contextos raros; ignorar
      }
    });

    return Array.from(elems);
  }

  // Guarda los elementos y su estado original para restaurar después
  let overriddenElements = [];

  function enableDarkModeOverrides() {
    // agrega clase general (para reglas CSS que ya tienes)
    document.body.classList.add("dark-mode");

    // recolectar elementos a manejar
    const targets = collectElementsToOverride();

    overriddenElements = targets.map(el => {
      // guardar originales
      const orig = {
        el,
        origBgInline: el.style.backgroundColor || el.style.background || "",
        origColorInline: el.style.color || "",
        origBackgroundImage: el.style.backgroundImage || "",
      };

      // Decide un fondo de panel si el elemento parece una tarjeta/panel (tiene padding o clase 'p-4')
      const isPanel = el.classList.contains("p-4") || el.classList.contains("shadow") || el.classList.contains("login-box") || el.classList.contains("register-box") || el.classList.contains("footer");

      // Aplica fondo oscuro inline (sobrescribe estilos en línea concretamente)
      try {
        el.style.backgroundImage = "none";
        el.style.backgroundColor = isPanel ? DARK_PANEL_BG : DARK_BG;
        // si el elemento tiene texto directamente, cambiar color también
        el.style.color = DARK_TEXT;
      } catch (e) {
        // no bloquear si falla en algún elemento
      }

      return orig;
    });
  }

  function disableDarkModeOverrides() {
    // quitar clase general
    document.body.classList.remove("dark-mode");

    // restaurar inline styles guardados
    overriddenElements.forEach(obj => {
      const el = obj.el;
      // Restaurar background-image y backgroundColor y color
      if (obj.origBackgroundImage !== undefined) el.style.backgroundImage = obj.origBackgroundImage;
      if (obj.origBgInline !== undefined) el.style.backgroundColor = obj.origBgInline;
      if (obj.origColorInline !== undefined) el.style.color = obj.origColorInline;
    });

    overriddenElements = [];
  }

  // Toggle robusto de contraste
  contrastBtn.addEventListener("click", () => {
    const enabled = document.body.classList.contains("dark-mode");
    if (!enabled) {
      enableDarkModeOverrides();
    } else {
      disableDarkModeOverrides();
    }
  });

});
