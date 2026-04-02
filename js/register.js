document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreUsuario = document.getElementById("nombreUsuario").value.trim();
    const email = document.getElementById("emailReg").value.trim();
    const password = document.getElementById("passwordReg").value.trim();
    const pais = document.getElementById("pais").value.trim();
    const acepto = document.getElementById("aceptoTerminos").checked;

    // =========================
    // VALIDACIONES 🔥
    // =========================

    // Campos vacíos
    if (!nombreUsuario || !email || !password || !pais) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Email válido
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email)) {
      alert("Ingrese un correo válido");
      return;
    }

    // Contraseña mínima
    if (password.length < 6) {
      alert("La contraseña debe tener mínimo 6 caracteres");
      return;
    }

    // Nombre usuario mínimo
    if (nombreUsuario.length < 3) {
      alert("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }

    // Aceptar términos
    if (!acepto) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    // =========================
    // ENVÍO AL BACKEND
    // =========================
    try {
      const response = await fetch("backend/register.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nombreUsuario, email, password, pais })
      });

      const data = await response.json();

      if (data.status === "success") {
        alert("Registro exitoso");
        window.location.href = "login.html";
      } else {
        alert(data.message);
      }

    } catch (error) {
      alert("Error en el servidor");
      console.error(error);
    }
  });
});