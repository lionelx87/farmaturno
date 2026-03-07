# <img src="public/favicon.svg" width="36" valign="middle" /> Farmaturno

> Farmacias de turno de Bariloche — con mapa, teléfono y navegación desde tu ubicación.

Aplicación web que reemplaza la experiencia de buscar qué farmacia está de turno hoy. Muestra las farmacias activas en un mapa interactivo, permite llamar directamente desde el teléfono y traza la ruta desde tu ubicación actual.

---

## ✨ Características

- 🗺️ **Mapa interactivo** con pins por cada farmacia de turno del día
- 📅 **Selector de fecha** para consultar hasta 2 días adelante o 7 días atrás
- 🧭 **Ruta navegable** desde tu ubicación hasta la farmacia seleccionada
- 📞 **Teléfono directo** para llamar con un toque (obtenido via Google Places API)
- 📱 **Diseño responsive**: sidebar en desktop, bottom sheet deslizable en mobile
- 🌙 **Dark / light mode** con toggle en la interfaz

---

## 🛠️ Stack

| | Tecnología | Versión | Rol |
|---|---|---|---|
| <img src="https://astro.build/assets/press/astro-icon-light-gradient.svg" width="20" /> | [Astro](https://astro.build) | 5.17 | Framework principal, SSR + islands |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="20" /> | [React](https://react.dev) | 19 | Island interactivo (mapa + sidebar) |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" width="20" /> | [Tailwind CSS](https://tailwindcss.com) | 4.2 | Estilos utility-first, dark mode class-based |
| <img src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" width="20" /> | [vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/) | 1.7 | Mapa, pins y rutas (Google Maps Platform) |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" width="20" /> | [TypeScript](https://www.typescriptlang.org) | 5.9 | Modo strict, default de Astro 5 |
| <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/vercel/vercel-original.svg" width="20" /> | [Vercel](https://vercel.com) | — | Deploy y analytics |

---

## 🏗️ Arquitectura

La app sigue una estrategia de **fetch mínimo + filtrado client-side**:

```
Usuario accede a la app
        │
        ▼
Astro Server: ¿hay datos en caché del día?
   ├── Sí → entrega datos cacheados al island
   └── No → fetch al endpoint externo → cachea por 24hs → entrega al island
                                │
                                ▼
                    Client Island (React 19)
                        - Filtra por fecha seleccionada (sin fetch adicional)
                        - Consulta teléfono y coordenadas a Google Places API
                        - Cachea resultados de Places en localStorage
                        - Renderiza mapa con pins y ruta al usuario
```

- ⚡ El endpoint externo se consulta **una sola vez por día**, independientemente del tráfico.
- 🔍 Todo cambio de fecha en la UI filtra el dataset ya disponible en memoria — sin llamados al servidor.
- 💾 Teléfono y coordenadas se obtienen de **Google Places API** por farmacia, la primera vez que aparece, y se cachean en `localStorage` indefinidamente.

Ver detalles completos en [`docs/architecture.md`](docs/architecture.md).

---

## 📋 Requisitos

- [Node.js](https://nodejs.org) >= 18
- [pnpm](https://pnpm.io)
- Cuenta en [Google Maps Platform](https://console.cloud.google.com/google/maps-apis) con las siguientes APIs habilitadas:
  - Maps JavaScript API
  - Places API (New)
  - Directions API

---

## 🔑 Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
PHARMACIES_ENDPOINT=          # URL del endpoint externo de farmacias de turno
PUBLIC_GOOGLE_MAPS_API_KEY=   # API key de Google Maps Platform
PUBLIC_GOOGLE_MAP_ID=         # Map ID creado en Google Maps Platform → Map styles
```

---

## 🚀 Desarrollo local

```sh
pnpm install
pnpm dev
```

La app corre en `http://localhost:4321`.

---

## 🧞 Comandos

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo en `localhost:4321` |
| `pnpm build` | Build de producción en `./dist/` |
| `pnpm preview` | Preview del build local |
| `pnpm astro check` | Chequeo de tipos TypeScript en archivos `.astro` |

---

## 📁 Estructura del proyecto

```
src/
├── styles/global.css         ← Tailwind + dark mode variant
├── layouts/Layout.astro      ← Layout base
├── pages/index.astro         ← Única página
├── components/
│   ├── PharmacyMap.tsx       ← Island React principal (mapa + estado global)
│   └── Sidebar.tsx           ← Panel de farmacias (sidebar / bottom sheet)
├── lib/pharmacies.ts         ← Fetch al endpoint + caché diario
└── types/pharmacy.ts         ← Tipos TypeScript del dominio
```

---

## 📄 Licencia

MIT
