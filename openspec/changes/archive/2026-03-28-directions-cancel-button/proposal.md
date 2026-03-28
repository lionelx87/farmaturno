## Why

El botón "Cómo llegar" permanece visible e idéntico una vez que el recorrido ya está activo en el mapa, lo que genera ambigüedad sobre el estado actual y sobre qué hace el botón en ese momento.

## What Changes

- El botón "Cómo llegar" muta a "Cancelar recorrido" cuando `routeOrigin !== null`
- El estilo del botón en estado activo cambia a tono suave (outline/neutro) para diferenciarse del estado inactivo
- Al cancelar: se limpia `routeOrigin`, se detiene el `watchPosition` y se resetea `locationStatus` a `idle`
- `userLocation` y `distances` se mantienen al cancelar (son datos del entorno, no del recorrido)
- Los botones de modo de viaje (a pie / en auto) permanecen siempre visibles cuando la farmacia tiene coordenadas
- No se limpia el estado al deseleccionar una farmacia (permite revisar otras farmacias sin perder el recorrido activo)

## Capabilities

### New Capabilities

- `directions-cancel`: Acción para cancelar un recorrido activo, limpiando el origen y deteniendo el rastreo GPS

### Modified Capabilities

- ninguna

## Impact

- `src/components/PharmacyAppContext.tsx`: nuevo handler `onCancelDirections`, expuesto en el contexto
- `src/components/Sidebar.tsx`: lógica condicional en `PharmacyDetailCard` para alternar entre ambos botones
