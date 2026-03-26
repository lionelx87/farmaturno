## Context

El banner global `closingTime` muestra un único horario de cierre para todas las farmacias activas del día. La función `getClosingTime(hour)` devuelve `{ time: '23:00', tomorrow: false }` para la ventana 09:00–22:59, lo cual es incorrecto: las dos primeras farmacias del listado continúan en turno overnight hasta las 09:00 del día siguiente, mientras que las farmacias con index >= 2 son day-only y sí cierran a las 23:00.

El código ya codifica esta distinción implícitamente en `getActivePharmacies` mediante `slice(0, 2)` para la ventana nocturna.

## Goals / Non-Goals

**Goals:**
- Corregir el mensaje del banner en la ventana 09:00–22:59 para que refleje el turno de mayor duración
- Diferenciar visualmente las farmacias day-only con un badge "hasta 23:00"
- Exponer `isOvernightMix` en el contexto React para mantener la lógica de presentación fuera del componente

**Non-Goals:**
- Cambiar la lógica de `getActivePharmacies` o el modelo de datos
- Soportar estructuras de turno distintas a las actuales (2 overnight + N day-only)
- Obtener información de turno del endpoint externo (no controlado)

## Decisions

### 1. Cambiar el banner 09:00–22:59 a "hasta 09:00 de mañana"

El banner representa el turno disponible de mayor duración. En la ventana conflictiva, las farmacias overnight son las que estarán disponibles más tiempo. Usar su horario de cierre como referencia del banner es más preciso y consistente con lo que el usuario necesita saber ("¿hasta cuándo hay guardia?").

**Alternativa descartada**: mantener "hasta 23:00" y solo agregar badge en overnight. Pero esto deja el banner incorrecto para la mayoría de los casos de uso real (el usuario llega a las 22:30 y ve "hasta 23:00" cuando en realidad hay cobertura hasta las 9am).

### 2. Badge en farmacias day-only (index >= 2)

La heurística de índice ya existe en `getActivePharmacies`. Reutilizarla para el badge mantiene consistencia sin introducir un nuevo concepto. El badge marca la **excepción** (cierre temprano), no la norma.

**Alternativa descartada**: mostrar el horario en todas las farmacias (opción 3 explorada). Agrega ruido visual cuando toda la información ya está en el banner global.

### 3. `isOvernightMix` en el contexto

El Sidebar no debe recalcular la hora actual ni conocer los umbrales de turno. Esa lógica vive en el contexto. Un booleano `isOvernightMix` es la interfaz mínima suficiente.

**Condición**: `selectedDate === today && hour >= 9 && hour < 23 && pharmaciesForDay.length > 2`

La condición incluye `pharmaciesForDay.length > 2` para evitar mostrar el badge si el endpoint solo devuelve 1 o 2 farmacias para ese día (en ese caso todas son overnight y no hay ambigüedad).

## Risks / Trade-offs

- **Dependencia del orden del endpoint** → Si el endpoint cambia el orden de las farmacias (overnight primero), la heurística falla silenciosamente. Mitigación: documentado como limitación conocida; se revisará si el endpoint se vuelve controlable.
- **Badge en mobile** → El listado en mobile tiene espacio reducido. El badge debe ser compacto (texto pequeño, sin icono) para no desplazar el botón de teléfono. Se valida visualmente en la implementación.
