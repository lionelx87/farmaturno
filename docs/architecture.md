# Arquitectura - Farmaturno

## Decisiones tecnológicas

| Tecnología | Versión | Razón |
|---|---|---|
| Astro | 5.17 | App acotada, fetch diario cacheado, islands bien delimitados |
| React | 19 | Ecosistema más maduro para Google Maps (`@vis.gl/react-google-maps`) |
| Tailwind CSS | 4.2 | Utility-first, dark mode class-based nativo, integración Vite sin config file |
| TypeScript | strict | Default de Astro 5, mejor DX y seguridad de tipos |
| @astrojs/vercel | 9.x | Adaptador SSR para Vercel. Habilita rendering server-side en cada request con cache en memoria para el fetch diario |

### Modo de output: SSR

El proyecto usa `output: 'server'` (SSR) en lugar de `output: 'static'`.

**Por qué no static:** en modo estático los datos quedan congelados al momento del deploy. Para actualizarlos diariamente habría que configurar un redeploy automático externo.

**Por qué no ISR:** Vercel ISR invalida el cache por tiempo transcurrido (TTL en segundos), no por fecha de Argentina. Con un TTL de 86400s el cache podría expirar a las 23:50, sirviendo datos desactualizados durante casi todo el nuevo día.

**Por qué SSR:** en cada request el servidor evalúa la fecha actual en timezone de Argentina. Si coincide con el cache existente, lo usa. Si cambió (nuevo día), hace un nuevo fetch. Esto garantiza que los datos se renuevan exactamente al cambiar el día en Argentina, sin importar a qué hora llega el primer request.

---

## Estrategia de datos

### El endpoint externo

- Existe un único endpoint (no controlado por el equipo) que devuelve un array con todas las farmacias de turno.
- El rango de datos que devuelve abarca desde aproximadamente 3 años atrás hasta algunos días adelante de la fecha en que se realiza la consulta.
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

Esto es posible porque el payload del endpoint ya contiene el rango de fechas completo que el usuario puede necesitar consultar.

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
- El `textQuery` incluye nombre **y dirección** de la farmacia para mayor precisión: `"${name} ${address} Bariloche"`.
- Las direcciones del endpoint se normalizan antes de usarlas: se inserta espacio entre letra y dígito pegados (ej. `"Hermann3995"` → `"Hermann 3995"`).
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
2. **Selector de fecha**: `‹ Lunes 2 de marzo ›` — flechas para avanzar/retroceder un día. Rango: 7 días atrás hasta el máximo disponible en los datos del endpoint. No se implementa calendario, las flechas son suficientes. Cuando la fecha seleccionada no es hoy, aparece un botón «Hoy» para volver. La fecha se sincroniza con la URL (`?fecha=YYYY-MM-DD`, `history.replaceState`) para deep-linking.
3. **Fila «Usar mi ubicación»**: pide geolocalización sin necesidad de seleccionar farmacia; al concederse se reemplaza por el indicador «Ordenadas por cercanía»
4. **Lista de farmacias**: ítems con nombre, dirección, chip de distancia (con ubicación concedida) e ícono de teléfono. Cada ítem es un `<div>` con `<button>` de selección y `<a href="tel:">` como hermanos (sin controles anidados). Con ubicación, la lista se ordena por distancia ascendente. Durante el mix nocturno se agrupa bajo encabezados de sección («Toda la noche · hasta las 09:00» / «Solo hasta las 23:00») usando el campo `shift` derivado del índice del payload original.
5. **Card de detalle**: debajo de la lista, muestra la farmacia seleccionada con nombre, dirección, teléfono y acciones de navegación

### Ubicación y rutas (flujo desacoplado)

- `onRequestLocation()` obtiene la ubicación y calcula distancias (haversine, `lib/distance.ts`) sin trazar rutas.
- La ruta solo se activa con «Cómo llegar» (`routeActive` explícito); seleccionar farmacia con ubicación ya concedida no dibuja ruta.
- Al activarse la ruta, `RoutesController` pide a Google Directions **ambos modos** (WALKING y DRIVING) y guarda los resultados en el contexto; alternar modo no emite requests. El selector segmentado muestra la duración de cada modo y el botón «Cancelar recorrido · X» la distancia de la ruta activa.
- «Cancelar recorrido» limpia solo la ruta: `userLocation`, distancias y orden por cercanía persisten.
- El re-ruteo por desplazamiento (>50 m vía `watchPosition`) actualiza ambos modos. Las distancias de la lista usan un origen estable (`distanceOrigin`) que no sigue al GPS, para que el orden no cambie durante la navegación.

### Mapa

- Pins de ubicación por cada farmacia de turno
- La geolocalización usa `enableHighAccuracy: true` para preferir GPS sobre posicionamiento por red

### Diseño responsive (mobile)

El Sidebar se convierte en un **bottom sheet** con tres posiciones de snap:
- **Mínima** (~148 px): handle + header + selector de fecha
- **Media** (~45 dvh, posición inicial): mapa y lista conviven
- **Completa** (~85 dvh)

El arrastre se hace solo desde el handle (pointer events, `touch-action: none`) con snap a la posición más cercana al soltar; un tap en el handle alterna media ↔ completa. Con `prefers-reduced-motion` no hay animación. Con farmacia seleccionada, el sheet pasa al modo card compacto (sin snap).

El mapa permanece visible e interactuable detrás del bottom sheet en todo momento.

### Tema

Soporte dark/light con toggle en el header del sidebar. Dark mode implementado con clase `dark` en `<html>` y `@custom-variant dark` de Tailwind 4.

El estado `isDark` vive en `PharmacyAppContext` y lo consumen `Sidebar` y `Map`. El mapa usa `colorScheme='DARK'|'LIGHT'` de `@vis.gl/react-google-maps` para sincronizar su apariencia con el tema. Se usa `reuseMaps` para evitar recrear la instancia del mapa al cambiar `colorScheme`.

El tema también se propaga al navegador: `color-scheme` en `<html>` y `<meta name="theme-color">` se actualizan tanto en el script inline de `Layout.astro` (carga inicial) como en el toggle.

### Variables de entorno requeridas

- `PHARMACIES_ENDPOINT` — URL del endpoint externo (server-side)
- `PUBLIC_GOOGLE_MAPS_API_KEY` — API key de Google Maps Platform (Maps JS API + Places API + Directions API)
- `PUBLIC_GOOGLE_MAP_ID` — Map ID creado en Google Maps Platform → Map styles

---

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
