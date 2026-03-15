## Context

La app ya tiene toda la lógica de turnos encapsulada en `getActivePharmacies` (`PharmacyAppContext.tsx`). Esa función determina qué farmacias mostrar según la hora actual, usando los umbrales fijos de **09:00** y **23:00**. El horario estimado de cierre es un subproducto directo de esa misma lógica: dado que sabemos cuándo termina cada turno, podemos derivarlo sin nuevos datos ni llamadas externas.

## Goals / Non-Goals

**Goals:**
- Calcular el horario de cierre estimado a partir de la misma lógica de turnos existente.
- Exponerlo en el contexto junto a `pharmaciesForDate` para que `Sidebar` lo pueda renderizar.
- Mostrarlo solo cuando `selectedDate === today` (para fechas pasadas/futuras no tiene sentido).

**Non-Goals:**
- No modificar el endpoint ni los tipos de datos del servidor.
- No agregar una cuenta regresiva en tiempo real (solo texto estático "hasta las HH:MM").
- No manejar horarios especiales (feriados, emergencias) — el endpoint no los expone.

## Decisions

### Dónde calcular el horario de cierre

**Decisión**: calcular en `getActivePharmacies` (o función auxiliar adyacente) y retornar junto al array de farmacias como un valor separado.

**Alternativas consideradas**:
- Calcularlo en `Sidebar` directamente → duplica la lógica de umbrales; si `getActivePharmacies` cambia, hay que actualizar dos lugares.
- Agregar `closingTime` como campo en cada `Pharmacy` → no tiene sentido; el cierre es del turno, no de cada farmacia individual.
- Exponer una función `getClosingTime()` pura desde el contexto → más flexible, pero innecesario para un valor derivado simple.

**Elegido**: un retorno compuesto `{ pharmacies, closingTime }` desde `getActivePharmacies`, o bien una función pura separada `getClosingTime(hour)` que comparte los mismos umbrales.

### Formato del horario de cierre

**Decisión**: string formateado `"HH:MM"` (ej. `"23:00"`, `"09:00"`), calculado en el cliente.

La fecha de cierre puede ser hoy o mañana (turno nocturno cierra al día siguiente), así que el contexto debe exponer también si el cierre es "hoy" o "mañana" para que la UI pueda mostrarlo claramente (ej. `"hasta las 09:00 de mañana"`).

## Risks / Trade-offs

- **Los umbrales (09:00 y 23:00) están hardcodeados** → si cambia el esquema de turnos, hay que actualizar en dos lugares (lógica de filtrado + lógica de cierre). Mitigación: mantener ambos en el mismo archivo/función para que el cambio sea obvio.
- **Zona horaria**: `new Date().getHours()` usa la zona horaria del navegador del usuario, no la de Argentina. Para usuarios fuera de Argentina la hora mostrada podría ser incorrecta. Esto ya es un trade-off existente en `getActivePharmacies`.
