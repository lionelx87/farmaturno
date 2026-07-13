## Why

La información más valiosa de la app —qué farmacia queda más cerca y cuánto se tarda en llegar— está enterrada al final del flujo: las distancias solo aparecen después de elegir una farmacia y tocar "Cómo llegar", la lista nunca se ordena por cercanía, y la ruta dibujada no muestra duración. Además, el bottom sheet mobile tapa el mapa (el diferencial de la app) y hay deudas de accesibilidad, incluida una de HTML inválido (`<a>` anidado en `<button>`).

Diseño validado visualmente con mockups A/B: https://claude.ai/code/artifact/25fb425e-7c26-45ef-bcca-a254928eba29 (elegidas las opciones A en las 4 decisiones).

## What Changes

- Fila "Usar mi ubicación" sobre la lista de farmacias: pide geolocalización sin necesidad de seleccionar farmacia, muestra distancias en la lista, la ordena por cercanía y desaparece al concederse el permiso (se muestra indicador "Ordenadas por cercanía").
- El selector a pie / en auto pasa a ser un control segmentado con el tiempo estimado de cada modo visible ("🚶 5 min | 🚗 2 min") cuando hay ruta activa; el botón "Cancelar recorrido" muestra la distancia del recorrido.
- En el mix nocturno, la lista se agrupa con encabezados de sección ("Toda la noche · hasta las 09:00" / "Solo hasta las 23:00") en lugar de repetir chips ámbar por ítem; el detail card conserva su badge de horario.
- Bottom sheet mobile con 3 posiciones (mínima / media / completa) con arrastre y tap, posición media por defecto para que mapa y lista convivan.
- Cancelar recorrido deja de borrar `userLocation`: el punto azul y las distancias persisten; solo se quita la ruta.
- Botón "Hoy" junto al selector de fecha cuando la fecha seleccionada no es hoy.
- La fecha seleccionada se refleja en la URL (`?fecha=YYYY-MM-DD`) para deep-linking, sin recarga.
- Correcciones de accesibilidad y markup: el teléfono (`<a>`) sale del `<button>` del ítem de lista, `aria-pressed` en el selector de modo, `aria-live` en mensajes de estado de ubicación, `aria-hidden` en íconos decorativos, `<meta name="theme-color">` y `color-scheme` acordes al tema.

## Capabilities

### New Capabilities

- `nearby-sorting`: punto de entrada de geolocalización a nivel lista, cálculo de distancias sin selección previa y orden por cercanía con indicador.
- `route-eta`: tiempos estimados por modo de viaje integrados en el selector segmentado y distancia del recorrido en el botón de cancelar.
- `bottom-sheet-snap`: bottom sheet mobile con tres posiciones (mínima / media / completa), arrastre y posición media por defecto.
- `date-url-sync`: sincronización de la fecha seleccionada con la URL (`?fecha=`) y botón "Hoy" para volver a la fecha actual.
- `markup-accessibility`: semántica y accesibilidad del markup (teléfono fuera del botón de lista, `aria-pressed`, `aria-live`, `aria-hidden`, `theme-color` / `color-scheme`).

### Modified Capabilities

- `directions-cancel`: cancelar el recorrido deja de limpiar `userLocation`; el punto azul y las distancias persisten (hoy el requirement exige limpiar `userLocation`).
- `per-pharmacy-shift-badge`: en la lista, los badges de horario por ítem se reemplazan por encabezados de sección durante el mix nocturno; el badge se conserva solo en el detail card.
- `pharmacy-detail-mobile-layout`: el toggle de modo de viaje inline pasa a control segmentado con tiempos por modo cuando hay ruta activa.

## Impact

- `src/components/Sidebar.tsx`: fila de ubicación, orden/agrupación de lista, control segmentado, botón "Hoy", fix `<a>`/`<button>`, aria-*.
- `src/components/PharmacyAppContext.tsx`: acción de geolocalización independiente de la selección, orden por cercanía, `onCancelDirections` sin borrar `userLocation`, estado de ETAs por modo, sincronización de fecha con URL.
- `src/components/PharmacyMap.tsx`: `DirectionsLayer` expone duración/distancia de la ruta (hoy descarta el resultado); posible segundo request para el modo alternativo.
- `src/layouts/Layout.astro`: `theme-color` y `color-scheme`.
- Sin cambios de dependencias ni de API del servidor; Google Directions puede recibir hasta 2 requests por ruta (uno por modo).
