## Why

Los usuarios que llegan a la app no saben cuánto tiempo les queda antes de que la farmacia de turno deje de atender. Mostrar el horario estimado de cierre les permite planificar si conviene ir ahora o esperar al turno siguiente.

## What Changes

- Calcular el horario estimado de cierre de cada farmacia activa, derivado de la misma lógica de `getActivePharmacies` que ya existe.
- Mostrar ese horario en la UI (sidebar desktop y bottom sheet mobile), junto al nombre y dirección de cada farmacia.

La lógica de turnos ya implícita en el código es:
- **Turno diurno** (09:00–23:00): farmacias del día actual → cierran a las **23:00**
- **Turno nocturno** (23:00–09:00): primeras 2 farmacias del día → cierran a las **09:00** del día siguiente
- **Madrugada** (00:00–08:59): las 2 farmacias del día anterior siguen activas → cierran a las **09:00** de hoy

No es necesario cambiar el endpoint ni los tipos de datos: la hora de cierre se calcula en el cliente a partir de la hora actual y la misma lógica que determina qué farmacias son activas.

## Capabilities

### New Capabilities

- `estimated-closing-time`: Calcula y muestra el horario estimado de cierre de las farmacias activas, derivado de la lógica de turnos existente. Solo se muestra cuando `selectedDate === today` (para fechas pasadas/futuras no aplica).

### Modified Capabilities

<!-- Sin specs existentes aún -->

## Impact

- `src/components/PharmacyAppContext.tsx` — exponer el horario estimado de cierre como parte del contexto o junto a `pharmaciesForDate`
- `src/components/Sidebar.tsx` — renderizar el horario de cierre en la lista de farmacias y/o card de detalle
