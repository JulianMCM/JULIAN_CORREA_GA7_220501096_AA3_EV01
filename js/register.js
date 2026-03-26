// register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombres = document.getElementById("nombres").value.trim();
    const apellidos = document.getElementById("apellidos").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const fecha = document.getElementById("fechaNacimiento").value;
    const email = document.getElementById("emailReg").value.trim();
    const password = document.getElementById("passwordReg").value.trim();
    const terminos = document.getElementById("aceptoTerminos").checked;

    if (!nombres || !apellidos || !cedula || !fecha || !email || !password) {
      alert("Por favor complete todos los campos.");
      return;
    }

    // email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Por favor ingrese un correo electrónico válido.");
      return;
    }

    // cedula numérica y razonable
    if (isNaN(cedula) || cedula.length < 6) {
      alert("Ingrese una cédula válida.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!terminos) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }

    // Simulación de registro exitoso
    alert("Registro exitoso (simulado). Ya puedes iniciar sesión.");
    form.reset();
    // redirigir a login (opcional)
    window.location.href = "login.html";
  });
});
