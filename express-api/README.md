# PlayCore Express API

API centralizada en Express para reemplazar los endpoints PHP sueltos de `backend/`.

## Inicio

```powershell
cd express-api
npm install
copy .env.example .env
npm run dev
```

Luego, en otra terminal:

```powershell
cd playcore-angular
npm.cmd run start:dev
```

La API expone rutas limpias como `/backend/games`, `/backend/auth/login`, `/backend/cart`, y tambien mantiene alias compatibles con los archivos anteriores, por ejemplo `/backend/videos.php` y `/backend/login.php`.
