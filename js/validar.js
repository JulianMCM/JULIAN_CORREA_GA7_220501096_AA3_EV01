document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Por favor, complete todos los campos.");
      return;
    }

    try {
      const response = await fetch("backend/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.status === "success") {
        window.location.href = "busqueda-avanzada.html";
      } else {
        alert("Correo o contraseña incorrectos");
      }

    } catch (error) {
      alert("Error en el servidor");
    }
  });
});