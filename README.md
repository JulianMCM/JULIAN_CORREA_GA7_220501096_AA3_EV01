# PlayCore

Proyecto compuesto por:

- `playcore-angular`: frontend en Angular.
- `express-api`: backend en Express conectado a MySQL.

## API REST

- `GET /backend/games`: consultar videojuegos.
- `POST /backend/auth/login`: iniciar sesion.
- `GET /backend/cart`: consultar carrito.
- `POST /backend/cart/items`: agregar un juego al carrito.
- `DELETE /backend/cart/items`: quitar un juego del carrito.
- `POST /backend/cart/purchase`: comprar el carrito.
- `GET /backend/profile`: consultar el perfil.

## Iniciar el proyecto

Primero inicia MySQL en WAMP/XAMPP y configura `express-api/.env` a partir de `express-api/.env.example`.

Terminal 1:

```powershell
cd express-api
npm install
npm run dev
```

Terminal 2:

```powershell
cd playcore-angular
npm install
npm.cmd run start:dev
```

Frontend: `http://localhost:4200`

API: `http://127.0.0.1:3000`

Health check: `http://127.0.0.1:3000/health`
