# CLAUDE.md - Farmaturno

Contexto y directivas para el desarrollo asistido por IA de este proyecto.

---

## Qué es este proyecto

Aplicación web moderna y responsive que muestra las farmacias de turno de una ciudad. Mejora la solución existente agregando número de teléfono, mapa interactivo con pins de ubicación y orientación desde la ubicación actual del usuario.

---

## Stack tecnológico

- **Framework**: Astro 5.17 (minimal, sin template)
- **Package manager**: pnpm
- **Island interactivo**: React 19 (via `@astrojs/react`)
- **Estilos**: Tailwind CSS 4.2 (via `@tailwindcss/vite`, sin config file, dark mode class-based)
- **Mapas**: `@vis.gl/react-google-maps`
- **Lenguaje**: TypeScript strict (por defecto en Astro 5)

---

## Estrategia de datos

Ver detalle completo en `docs/architecture.md`.

Resumen:
- Un único endpoint externo devuelve todas las farmacias de turno en un rango amplio de fechas (3 años atrás hasta 2 días adelante).
- El fetch se realiza **una sola vez por día** desde el servidor, con caché de 24hs.
- **Todo el filtrado por fecha es client-side**, sin llamados adicionales al servidor.
- El island React recibe el dataset completo como prop y opera de forma autónoma.

---

## Commits

- Formato **conventional commits**, una sola línea, sin body.
- **Sin co-author**: no agregar la línea `Co-Authored-By`.
- Ejemplo: `feat: add pharmacy map island`

---

## Forma de trabajo

Este proyecto busca que el desarrollador entienda y controle cada decisión. Las reglas son:

- **Un paso a la vez**: no realizar cambios masivos en múltiples archivos simultáneamente.
- **Debate antes de implementar**: si hay más de una forma razonable de resolver algo, plantear las opciones antes de escribir código.
- **Explicar el porqué**: cada decisión técnica debe tener una razón explícita.
- **El desarrollador tiene la última palabra** en cada decisión de diseño o implementación.

---

## Variables de entorno

- `PHARMACIES_ENDPOINT` — URL del endpoint externo de farmacias de turno

---

## Estructura de carpetas

```
src/
├── styles/global.css         ← Tailwind + dark mode variant + keyframes
├── layouts/Layout.astro      ← layout base, importa global.css, clase dark en <html>
├── pages/index.astro         ← única página
├── components/
│   ├── PharmacyMap.tsx       ← island React (mapa, cámara de navegación, llegada)
│   ├── PharmacyAppContext.tsx ← estado global del island (fechas, rutas, navegación)
│   ├── Sidebar.tsx           ← sidebar desktop / bottom sheet mobile
│   └── SimulationPanel.tsx   ← panel del simulador de desplazamiento (dev)
├── lib/
│   ├── pharmacies.ts         ← fetch al endpoint + caché diario
│   ├── places.ts             ← teléfono y coordenadas vía Google Places
│   ├── distance.ts           ← distancias haversine para chips
│   ├── route-geometry.ts     ← proyección sobre polilínea, bearing, desplazamientos
│   └── geolocation.ts        ← proveedor de geolocalización (real + simulado con ?sim)
└── types/pharmacy.ts         ← tipos TypeScript del dominio
```

---

## Mantener documentación actualizada

Al final de cada sesión de trabajo, o ante cualquier decisión técnica relevante, actualizar:
- `CLAUDE.md` — si cambia el stack, las convenciones o la forma de trabajo
- `docs/architecture.md` — si cambia el diseño, la UI, o las decisiones de arquitectura

---

## Archivos clave

- `docs/architecture.md` — decisiones de arquitectura y diseño UI documentadas
- `CLAUDE.md` — este archivo
