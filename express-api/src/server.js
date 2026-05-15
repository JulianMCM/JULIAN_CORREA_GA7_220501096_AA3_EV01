const app = require('./app');
const { port } = require('./config/env');

// Punto de entrada real: levanta la aplicacion Express en el puerto configurado.
app.listen(port, () => {
  console.log(`PlayCore API escuchando en http://127.0.0.1:${port}`);
});
