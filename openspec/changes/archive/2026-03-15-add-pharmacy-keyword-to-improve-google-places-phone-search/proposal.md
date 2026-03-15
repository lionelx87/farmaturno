## Why

La búsqueda de teléfono y coordenadas en Google Places usa el query `${name} ${address} Bariloche`. En algunos casos el nombre por sí solo no es suficientemente específico, generando resultados ambiguos o incorrectos. Agregar `"farmacia"` como prefijo al query mejora la precisión sin cambiar la lógica de caché existente.

## What Changes

- El query enviado a Google Places pasa de `${name} ${address} Bariloche` a `farmacia ${name} ${address} Bariloche`.
- No se modifica la estructura de caché ni las claves de localStorage (la clave seguirá siendo el nombre original de la farmacia).
- No se modifica ninguna otra parte del flujo de datos ni de la UI.

## Capabilities

### New Capabilities

_(ninguna — es una mejora interna, no introduce una capacidad nueva visible para el usuario)_

### Modified Capabilities

- `google-places-phone-lookup`: El query de búsqueda incluye ahora el prefijo `"farmacia"` para mejorar la precisión de los resultados de Places.

## Impact

- `src/lib/places.ts`: cambio de una línea en `fetchPlaceData`, en la construcción del `textQuery`.
- Sin impacto en la API pública del módulo, en los tipos, ni en el caché de localStorage.
