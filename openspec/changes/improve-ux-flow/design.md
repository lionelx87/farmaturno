## Context

El estado de la app vive en `PharmacyAppContext` (React 19, island de Astro). Hoy la geolocalización solo se dispara desde "Cómo llegar" en el detail card, y un efecto traza la ruta automáticamente apenas existen `userLocation` + `selectedPharmacy`. `DirectionsLayer` pide la ruta a Google y descarta duración/distancia del resultado. El bottom sheet mobile tiene dos estados (expandido/minimizado) alternados por tap. Mockup de referencia con las decisiones de diseño ya elegidas: https://claude.ai/code/artifact/25fb425e-7c26-45ef-bcca-a254928eba29

## Goals / Non-Goals

**Goals:**
- Ubicación y distancias disponibles antes de seleccionar farmacia, con lista ordenada por cercanía.
- ETA por modo de viaje visible en el selector segmentado; distancia del recorrido en el botón de cancelar.
- Lista agrupada por secciones de horario en el mix nocturno.
- Bottom sheet con tres posiciones y arrastre, media por defecto.
- Fecha en URL, botón "Hoy", correcciones de accesibilidad y markup.

**Non-Goals:**
- No se agrega Distance Matrix API: los chips de distancia de la lista siguen usando haversine (`lib/distance.ts`).
- No se cambia el fetch diario del servidor ni la estrategia de caché.
- No se agrega librería de bottom sheet ni de gestos: implementación propia con pointer events.
- No se persiste la farmacia seleccionada en la URL (solo la fecha).

## Decisions

### 1. Desacoplar ubicación de ruta con estado explícito `routeActive`

Hoy el efecto de `PharmacyAppContext` traza la ruta cuando `userLocation && selectedPharmacy`. Con la fila "Usar mi ubicación" eso rompería: al tocar cualquier farmacia con ubicación ya concedida se dibujaría una ruta no pedida.

- Nueva acción `onRequestLocation()`: pide `getCurrentPosition`, setea `userLocation` y `locationStatus`. No toca la ruta.
- La ruta solo se activa con `onGetDirections()` (que reutiliza `userLocation` si existe, o lo pide primero) y se apaga con `onCancelDirections()`, que limpia solo `routeOrigin`/`routeActive` y detiene el `watchPosition`. `userLocation` y `distances` persisten.
- El `watchPosition` (seguimiento + re-ruteo a 50 m) se condiciona a `routeActive`, no a `userLocation && selectedPharmacy`.

Alternativa considerada: inferir la ruta de `selectedPharmacy !== null` como hoy — descartada porque acopla selección con navegación, justamente el problema a resolver.

### 2. Cálculo de rutas elevado a contexto, un request por modo, renderer sin request propio

Para mostrar "🚶 5 min | 🚗 2 min" hacen falta ambos modos. Si `DirectionsLayer` sigue pidiendo su propia ruta, el modo activo se pediría dos veces.

- El contexto (o un hook `useRoutes` interno al provider del mapa) pide `DirectionsService.route()` para WALKING y DRIVING al activarse la ruta y ante cada re-ruteo, y guarda `routeResults: { WALKING?: {result, duration, distance}, DRIVING?: ... }`.
- `DirectionsLayer` deja de llamar al service: recibe el `DirectionsResult` del modo activo y solo hace `renderer.setDirections(result)`. Cambiar de modo es instantáneo (resultado ya en memoria).
- El selector segmentado muestra la duración formateada de cada modo; con resultado pendiente muestra "…". El botón cancelar muestra la distancia del modo activo.

Alternativa considerada: pedir solo el modo activo y el otro al alternar (opción B del mockup) — descartada por elección de diseño (opción A) y porque el costo es acotado: 2 requests por activación/re-ruteo.

### 3. Orden por cercanía subordinado a la agrupación horaria

Cuando hay mix nocturno, la agrupación por sección es primaria y la distancia ordena dentro de cada grupo (una farmacia cerrada a las 23:05 no sirve por cerca que quede). Sin mix, la lista entera se ordena por distancia. Sin ubicación, se mantiene el orden del endpoint. La identidad overnight/day-only deja de depender del índice visual: se calcula antes de ordenar (los índices 0–1 del payload original) y se lleva como campo (`shift: 'overnight' | 'day'`) en `PharmacyEnriched`, eliminando la fragilidad del `index < 2` sobre la lista ya reordenada.

### 4. Fila "Usar mi ubicación" con ciclo de vida propio

Se renderiza sobre la lista cuando `locationStatus === 'idle'` y no hay `userLocation`. En `loading` muestra "Obteniendo ubicación…", en `denied`/`unavailable` muestra el mensaje de error inline (`aria-live="polite"`) y con permiso concedido se reemplaza por el indicador compacto "Ordenadas por cercanía".

### 5. Bottom sheet: 3 snap points con pointer events, drag solo desde el handle

Posiciones: mínima (solo handle + fecha, ~140 px), media (~45 dvh, default) y completa (~85 dvh). Implementación propia: `pointerdown/move/up` sobre el handle con `touch-action: none`, transform con `translateY` y transición al soltar hacia el snap más cercano (respetando `prefers-reduced-motion`). El drag se limita al handle para no pelear con el scroll interno de la lista; tap en el handle alterna media ↔ completa. El modo card (farmacia seleccionada) mantiene su comportamiento actual.

Alternativa considerada: librería (vaul, react-modal-sheet) — descartada para no sumar dependencia por un gesto acotado.

### 6. Fecha en URL con `history.replaceState`

Al iniciar, se lee `?fecha=YYYY-MM-DD` y se usa si está en `availableDates` (si no, fallback actual). `onDateChange` hace `history.replaceState` con el query param (sin recarga, sin entrada de historial por cada flecha). El botón "Hoy" aparece junto al selector cuando `selectedDate !== today`.

### 7. Ítem de lista: `<button>` y `<a>` como hermanos

El ítem pasa a ser un `<div>` contenedor con dos hijos interactivos: el `<button>` de selección (ocupa el ancho) y el `<a href="tel:">` al lado. Elimina el HTML inválido actual (`<a>` dentro de `<button>`) sin perder ninguna de las dos acciones.

## Risks / Trade-offs

- [Doble request a Directions por activación y re-ruteo] → Costo acotado (2 requests por gesto explícito del usuario); el re-ruteo ya está limitado por el umbral de 50 m.
- [Chip de distancia (haversine, línea recta) convive con distancia de ruta real en el cancelar] → Se mantiene el prefijo "~" en los chips; la distancia de ruta solo aparece en contexto de ruta activa.
- [Gestos de drag en iOS Safari (rubber-banding, scroll fantasma)] → `touch-action: none` en el handle, `overscroll-behavior: contain` en el contenido del sheet.
- [Orden por cercanía reordena la lista al conceder permiso y puede desorientar] → El indicador "Ordenadas por cercanía" explicita el cambio; el reorden ocurre una vez, no en cada actualización de GPS.
- [`?fecha=` con valor inválido o fuera de rango] → Se ignora silenciosamente y se cae al comportamiento actual (`mostRecentAvailable`).

## Migration Plan

Sin migración de datos ni cambios de servidor. Implementación incremental por capacidad (convención del proyecto: un paso a la vez), cada una en su commit conventional. Rollback = revert del commit correspondiente; ninguna capacidad depende de otra para funcionar, salvo `route-eta` que asume el desacople de la decisión 1.

## Open Questions

- Ninguna bloqueante. Los textos finales de secciones y estados ("Toda la noche · hasta las 09:00", "Ordenadas por cercanía") se validan en el PR con el mockup como referencia.
