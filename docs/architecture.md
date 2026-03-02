# Arquitectura - Farmaturno

## Decisiones tecnológicas

| Tecnología | Versión | Razón |
|---|---|---|
| Astro | 5.17 | App acotada, fetch diario cacheado, islands bien delimitados |
| React | 19 | Ecosistema más maduro para Google Maps (`@vis.gl/react-google-maps`) |
| Tailwind CSS | 4.2 | Utility-first, dark mode class-based nativo, integración Vite sin config file |
| TypeScript | strict | Default de Astro 5, mejor DX y seguridad de tipos |

---

## Estrategia de datos

### El endpoint externo

- Existe un único endpoint (no controlado por el equipo) que devuelve un array con todas las farmacias de turno.
- El rango de datos que devuelve abarca desde aproximadamente 3 años atrás hasta 2 días adelante de la fecha en que se realiza la consulta.
- No es posible pedir un subconjunto de fechas: siempre devuelve el rango completo.

### Fetch diario con caché

El llamado al endpoint se realiza **una única vez por día**, desde el servidor de Astro. El resultado se cachea durante 24 horas (o hasta el siguiente día).

**Por qué es suficiente con un llamado diario:**
Los datos de turno no cambian dentro de un mismo día. Una vez obtenidos, son válidos para cualquier consulta que el usuario realice durante esa jornada. No tiene sentido repetir el fetch para cada visita o cada cambio de fecha en la UI.

**Consecuencia importante:** el servidor nunca llama al endpoint externo más de una vez por día, independientemente de cuántos usuarios accedan a la app.

### Filtrado client-side

Una vez que el servidor entrega los datos al cliente (ya filtrados del cache), **todo el filtrado por fecha ocurre en el navegador**, sin ningún llamado adicional al servidor ni al endpoint externo.

Cuando el usuario selecciona una fecha diferente en la interfaz:
1. No se realiza ningún fetch.
2. El cliente filtra el array ya disponible en memoria por la fecha seleccionada.
3. La UI se actualiza de forma instantánea.

Esto es posible porque el payload del endpoint ya contiene el rango de fechas completo que el usuario puede necesitar consultar (hasta 2 días adelante).

---

## Interactividad (Islands)

La mayor parte de la página es estática. La interactividad queda delimitada a un único island React que concentra:

- Selector de fecha con filtrado local
- Visualización de resultados (nombre, dirección, teléfono)
- Mapa con pins de ubicación (`@vis.gl/react-google-maps`)
- Ruta desde farmacia seleccionada hasta ubicación del usuario (Google Directions API)
- Integración con ubicación actual del usuario (Geolocation API)

Este island recibe los datos completos como prop desde Astro y opera de forma autónoma a partir de ahí.

### Obtención del teléfono y coordenadas

El endpoint **no provee teléfono** en los datos actuales (solo en entradas históricas, que nunca se muestran). Por lo tanto:

- **Google Places API** es la única fuente de verdad para teléfono y coordenadas (`lat`/`lng`).
- La consulta a Places se realiza **por farmacia, la primera vez que aparece** en la UI.
- El resultado se cachea en **`localStorage`** del navegador, sin expiración (el teléfono de una farmacia no cambia).
- Clave del caché: nombre de la farmacia (`PlacesCache = Record<string, PlacesData>`).
- Si Places no encuentra la farmacia, `phone` queda `null`.

---

## Diseño UI

### Layout general

Pantalla dividida en dos secciones:
- **Sidebar** (izquierda, desktop): panel fijo con toda la información y controles
- **Content area** (derecha, desktop): mapa ocupando todo el espacio disponible

### Sidebar — contenido (de arriba hacia abajo)

1. **Header**: ícono + nombre de la app, toggle dark/light
2. **Selector de fecha**: `‹ Lunes 2 de marzo ›` — flechas para avanzar/retroceder un día. Click en la fecha abre un calendario. Rango limitado a los datos disponibles del endpoint.
3. **Lista de farmacias**: 3 items con nombre, dirección e ícono de teléfono para llamada directa
4. **Card de detalle**: debajo de la lista, muestra la farmacia seleccionada con nombre, dirección y teléfono

### Mapa

- Pins de ubicación por cada farmacia de turno
- Al seleccionar una farmacia, traza la ruta desde ese pin hasta la ubicación actual del usuario

### Diseño responsive (mobile)

El Sidebar se convierte en un **bottom sheet** con dos estados:
- **Peek**: asomando desde abajo, mostrando la lista de farmacias
- **Expandido**: cubre ~60-70% de la pantalla, incluye también la card de detalle

El mapa permanece visible e interactuable detrás del bottom sheet en todo momento.

### Tema

Soporte dark/light con toggle en el header del sidebar. Dark mode implementado con clase `dark` en `<html>` y `@custom-variant dark` de Tailwind 4.

El estado `isDark` vive en `PharmacyMap` (ancestro común de `Sidebar` y `Map`) y se pasa como prop a ambos. El mapa usa `colorScheme='DARK'|'LIGHT'` de `@vis.gl/react-google-maps` para sincronizar su apariencia con el tema. Se usa `reuseMaps` para evitar recrear la instancia del mapa al cambiar `colorScheme`.

### Variables de entorno requeridas

- `PHARMACIES_ENDPOINT` — URL del endpoint externo (server-side)
- `PUBLIC_GOOGLE_MAPS_API_KEY` — API key de Google Maps Platform (Maps JS API + Places API + Directions API)
- `PUBLIC_GOOGLE_MAP_ID` — Map ID creado en Google Maps Platform → Map styles

---

## Pendiente de implementar

- **Google Places API** — integración real para obtener teléfono y coordenadas (actualmente usa `MOCK_PLACES_CACHE`)
- **Datos reales del endpoint** — reemplazar `MOCK_PHARMACIES` por `fetchPharmacies()` en `index.astro`
- **Google Directions API** — ruta desde farmacia seleccionada hasta la ubicación del usuario
- **Calendario** — date picker al hacer click en la fecha del selector

---

## Flujo resumido

```
Usuario accede a la app
        │
        ▼
Astro Server: ¿hay datos en caché del día?
   ├── Sí → entrega datos cacheados al client island
   └── No → fetch al endpoint externo → cachea → entrega al client island
                                │
                                ▼
                    Client Island (React 19)
                        - Filtra por fecha seleccionada (local)
                        - Renderiza farmacias con teléfono
                        - Muestra mapa con pins (Google Maps API)
                        - Usa Geolocation API para ubicación del usuario
```
