# BaoTa Deploy Paths

## Frontend site

- Project path: `/root/LingTour/site`
- Build command: `npm install && npm run build`
- Startup file: `/root/LingTour/site/server.cjs`
- Suggested port: `3001`
- Required env:
  - `PORT=3001`
  - `HOST=0.0.0.0`
  - `NEXT_PUBLIC_API_URL=https://api.culvoy.com/api/v1`
  - `NEXT_OUTPUT=standalone`

## Admin frontend

- Project path: `/root/LingTour/admin-frontend`
- Build command: `npm install && npm run build`
- Startup file: `/root/LingTour/admin-frontend/server.cjs`
- Suggested port: `4173`
- Required env:
  - `PORT=4173`
  - `HOST=0.0.0.0`
  - `VITE_API_ORIGIN=https://api.culvoy.com`
  - `VITE_MEDIA_ORIGIN=https://api.culvoy.com`

## API

- Project path: `/root/LingTour/api`
- Build command: `npm install && npm run build`
- Startup file: `/root/LingTour/api/dist/main.js`
- Suggested port: `8000`

## Nginx target

- `culvoy.com` -> reverse proxy to `http://127.0.0.1:3001`
- `admin.culvoy.com` -> reverse proxy to `http://127.0.0.1:4173`
- `api.culvoy.com` -> reverse proxy to `http://127.0.0.1:8000`
