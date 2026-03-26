## Why

El banner global "Turno hasta las 23:00" es incorrecto en la ventana 09:00–23:00: solo aplica a algunas farmacias (las day-only), mientras que las overnight continúan disponibles hasta las 09:00 del día siguiente. Esto genera confusión al usuario que podría pensar que todas las farmacias cierran a las 23:00.

## What Changes

- El banner global en la ventana 09:00–22:59 pasa de mostrar "Turno hasta las 23:00" a "Turno hasta las 09:00 de mañana", reflejando el turno de mayor duración disponible.
- Las farmacias con index >= 2 en la lista de hoy (day-only, no continúan en el turno nocturno) reciben un badge "hasta 23:00" cuando el usuario está en la ventana conflictiva (hoy, 09:00–22:59).
- Se agrega `isOvernightMix: boolean` al contexto React para que el Sidebar pueda determinar cuándo mostrar el badge.

## Capabilities

### New Capabilities
- `per-pharmacy-shift-badge`: Badge por farmacia indicando horario de cierre diferenciado cuando las farmacias activas no comparten el mismo turno.

### Modified Capabilities
- `estimated-closing-time`: Cambia el requisito del escenario "Turno diurno activo" (09:00–22:59): el banner ya no muestra "hasta las 23:00" sino "hasta las 09:00 de mañana".

## Impact

- `src/components/PharmacyAppContext.tsx`: `getClosingTime` y valor del contexto (`isOvernightMix`)
- `src/components/Sidebar.tsx`: badge condicional en el listado de farmacias
- `openspec/specs/estimated-closing-time/spec.md`: actualizar el escenario de turno diurno
