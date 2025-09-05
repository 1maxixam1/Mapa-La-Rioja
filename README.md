# MapAlert — Render (backend) + Netlify (frontend)

Proyecto listo para desplegar **solo con Render y Netlify**.
- Backend: Node/Express + PostgreSQL (usá **PostgreSQL de Render**)
- Frontend: Vite/React en Netlify
- CORS con wildcard (`*.netlify.app`) y `http://localhost:5173` para desarrollo.

## 1) Test LOCAL apuntando a la base de Render
> Podés testear el backend local pero usando la base **PostgreSQL de Render** (sin Docker ni Neon).

1. En **Render**, creá una instancia de **PostgreSQL** y copiá su `DATABASE_URL`.
2. Configurá backend:
   ```bash
   cd server
   npm install
   cp .env.example .env
   # editá .env => DATABASE_URL=<DATABASE_URL_DE_RENDER>
   npm run migrate
   npm run dev   # http://localhost:8787
   ```
3. Frontend:
   ```bash
   cd ..
   npm install
   echo VITE_API_URL=http://localhost:8787 > .env.local
   npm run dev   # http://localhost:5173
   ```

## 2) Deploy del Backend en Render
1. Subí el repo con este contenido.
2. En Render: **New + → Blueprint** y elegí el repo (usa `render.yaml`).
3. Variables de entorno (en el servicio web):
   - `DATABASE_URL` = URL de PostgreSQL de Render
   - `ALLOWED_ORIGINS` = `*.netlify.app,http://localhost:5173`
4. Render ejecuta `npm install`, `npm start` y `postDeployCommand: npm run migrate`.

Verificá:
```bash
curl https://<tu-servicio>.onrender.com/api/health
# => {"ok":true}
```

## 3) Deploy del Frontend en Netlify
1. New site from Git → elegí el repo.
2. Build:
   - Command: `npm run build`
   - Publish dir: `dist`
3. Env var:
   - `VITE_API_URL=https://<tu-servicio>.onrender.com`

## 4) Troubleshooting
- **CORS**: asegurá `ALLOWED_ORIGINS=*.netlify.app,http://localhost:5173` en Render.
- **DB**: usá la `DATABASE_URL` de tu instancia de PostgreSQL en Render.
- **Front**: confirmá que `VITE_API_URL` apunta al backend en Render.

## 5) Endpoints
- `GET /api/markers`
- `POST /api/markers` (body con `lat,lng,streetName,details,type,createdBy,createdAt,expiresAt` en **ms**)
- `POST /api/markers/:id/vote` (body `{ user, isConfirm }`)
- `DELETE /api/markers/:id`

