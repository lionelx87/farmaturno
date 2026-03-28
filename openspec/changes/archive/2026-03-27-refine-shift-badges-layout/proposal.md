## Why

El sidebar muestra simultáneamente un banner general ("Turno hasta las 09:00 de mañana") y un badge individual solo en las farmacias day-only, generando una contradicción: el banner implica que todas las farmacias cierran a las 09:00 de mañana, pero la última cierra a las 23:00. Además, el layout de badges no garantiza alineación cuando conviven el badge de distancia y el de horario.

## What Changes

- **Banner suprimido en la ventana mix (09:00–22:59)**: cuando las farmacias tienen distintos horarios de cierre, se elimina el banner global y cada farmacia muestra su propio badge.
- **Todas las farmacias reciben badge en la ventana mix**: las overnight muestran "hasta las 09:00 h de mañana", las day-only muestran "hasta las 23:00 h".
- **Nuevo layout de badges con dos slots fijos**: slot izquierdo (`flex-1`) para distancia, slot derecho (`shrink-0`) para horario. El badge de horario siempre aparece alineado a la derecha, sin wrap.
- **Pill background en ambos badges**: el badge de distancia gana pill verde (consistente con el detail card); el badge de horario usa pill amber.
- **Sufijo "h" en todos los horarios**: aplica a banners y badges ("09:00 h", "23:00 h").

## Capabilities

### New Capabilities
- none

### Modified Capabilities
- `estimated-closing-time`: el banner se suprime cuando `isOvernightMix === true`; se agrega sufijo "h" a todos los strings de horario.
- `per-pharmacy-shift-badge`: se extiende para mostrar badge también en las farmacias overnight durante la ventana mix; nuevo layout de dos slots; pill styling; sufijo "h".

## Impact

- `src/components/PharmacyAppContext.tsx`: `closingTime` retorna `null` cuando `isOvernightMix === true`; strings de horario actualizados con sufijo "h".
- `src/components/Sidebar.tsx`: layout de badges reemplazado por dos slots fijos; pill styles en ambos badges; badge overnight agregado en ventana mix.
