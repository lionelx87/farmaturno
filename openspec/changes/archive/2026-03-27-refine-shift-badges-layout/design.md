## Context

El sidebar tiene dos mecanismos visuales para comunicar horarios de cierre: un banner global (`closingTime`) y un badge por farmacia (`isDayOnly`). Actualmente ambos coexisten en la ventana mix (09:00–22:59), lo que genera una contradicción visual: el banner dice "09:00 de mañana" pero el badge de la última farmacia dice "23:00".

El layout actual de badges usa `flex-wrap`, lo que produce alineación inconsistente cuando el badge de horario cae a una segunda línea (queda a la izquierda en lugar de a la derecha).

## Goals / Non-Goals

**Goals:**
- Eliminar la contradicción banner/badge en la ventana mix
- Garantizar alineación consistente del badge de horario (siempre a la derecha)
- Unificar el estilo visual de ambos badges (pill background)
- Añadir sufijo "h" a todos los strings de horario

**Non-Goals:**
- Cambiar la lógica de `getActivePharmacies` o el modelo de datos
- Soportar estructuras de turno distintas a las actuales (2 overnight + N day-only)
- Modificar el detail card de farmacia seleccionada

## Decisions

### 1. `closingTime` retorna `null` cuando `isOvernightMix === true`

El banner global solo tiene sentido cuando todas las farmacias comparten el mismo horario de cierre. En la ventana mix, la información es per-farmacia, no global. Devolver `null` desde el contexto es la interfaz mínima: el Sidebar ya tiene la lógica de renderizado condicional `{closingTime && ...}`.

**Alternativa descartada**: suprimir el banner en el Sidebar con `{closingTime && !isOvernightMix && ...}`. Agrega lógica de presentación en el componente que debería vivir en el contexto.

### 2. Badge para farmacias overnight en la ventana mix

En lugar de marcar solo la excepción (day-only), se marcan todas. Esto elimina la ambigüedad: el usuario no necesita inferir que "sin badge = cierra 09:00 de mañana". Cada farmacia dice explícitamente cuándo cierra.

La condición de badge overnight: `isOvernightMix && index < 2` → texto "hasta las 09:00 h de mañana".
La condición de badge day-only se mantiene: `isOvernightMix && index >= 2` → texto "hasta las 23:00 h".

**Alternativa descartada**: badge solo en day-only + cambiar el banner. Sigue requiriendo que el usuario combine dos fuentes de información (banner + badge) para entender el estado de cada farmacia.

### 3. Layout de badges en lista: `ms-auto` condicional

```
<div className="flex items-center gap-2 mt-1">
  {distance && <span>badge distancia</span>}
  {timeLabel && <span className={distance ? 'ms-auto' : ''}>badge horario</span>}
</div>
```

El badge de horario usa `ms-auto` solo cuando convive con el badge de distancia, empujándolo a la derecha. Sin distancia, queda alineado a la izquierda de forma natural. Sin wrap en ningún caso.

**Alternativa descartada**: dos divs con `justify-between`. El badge de horario flotaba al extremo derecho incluso sin badge de distancia, resultando visualmente desbalanceado con el slot izquierdo vacío.

### 4. Layout de badges en detail card: apilado vertical

En el detail card la columna de contenido es más estrecha (~220px) porque los botones de modo de viaje ocupan espacio a la derecha. Distancia y horario se muestran apilados en filas separadas (`block` con `mb-1.5` / `mb-2`), evitando cualquier wrap y manteniendo la legibilidad.

**Alternativa descartada**: misma fila que en lista. La restricción de ancho del detail card forzaba wrap dentro del badge, partiendo el texto "hasta las 09:00 h de / mañana" entre dos líneas.

### 4. Pill background en ambos badges

El detail card ya usa pill verde para la distancia. Llevar el mismo estilo a la lista crea consistencia visual entre la vista de lista y la de detalle. El badge de horario usa pill amber (coherente con el color actual del banner).

### 5. Sufijo "h" en strings de horario

Notación estándar en Argentina para horarios en contextos compactos. Aplica a `getClosingTime` en el contexto, que centraliza todos los strings.

## Risks / Trade-offs

- **Dependencia del orden del endpoint** → Si el endpoint cambia el orden (overnight ya no son los primeros 2), los badges serán incorrectos. Mitigación: limitación conocida y documentada; sin cambios respecto al estado actual.
- **Ancho del badge overnight en desktop** → "hasta las 09:00 h de mañana" (~156px a 11px) más el badge de distancia (~68px) suman ~232px sobre 251px disponibles. Entra sin wrap, pero con poca holgura. Mitigación: validar visualmente en implementación; si fuera necesario, abreviar a "mañana, 09:00 h".
