## Context

El módulo `src/lib/places.ts` busca cada farmacia en Google Places con el query `${name} ${address} Bariloche`. Google Places puede devolver negocios homónimos que no son farmacias si el nombre es genérico. Agregar `"farmacia"` al inicio del query aprovecha el índice de categorías de Places para priorizar resultados del tipo correcto.

El resultado se cachea en `localStorage` con clave igual al nombre original de la farmacia — cambiar el query no invalida el caché existente.

## Goals / Non-Goals

**Goals:**
- Mejorar la precisión de los resultados de Google Places agregando `"farmacia"` como prefijo al query.
- Cambio de una sola línea en `fetchPlaceData`, sin impacto en la interfaz de caché ni en los tipos.

**Non-Goals:**
- Invalidar el caché de localStorage existente.
- Cambiar la estrategia de caché o su tiempo de vida.
- Soporte para otros keywords o configuración dinámica del query.

## Decisions

**Prefijo `"farmacia"` en lugar de sufijo**
El query actual ya tiene contexto geográfico (`${address} Bariloche`) al final. Poner la categoría al inicio (`farmacia ${name} ${address} Bariloche`) le da a Places la señal de tipo desde el primer token, antes del nombre y la dirección, lo que mejora el ranking de resultados relevantes.

**No cambiar la clave de caché en localStorage**
La clave es el nombre de la farmacia, independiente del query construido. Cambiarla rompería el caché de todos los usuarios sin beneficio real.

## Risks / Trade-offs

- [Caché stale] Usuarios con datos cacheados bajo el query anterior podrían tener resultados imprecisos hasta que el caché expire o se limpie. → Riesgo bajo: solo afecta búsquedas ya cacheadas; el cambio mejora todas las búsquedas nuevas.
- [Falso negativo] Alguna farmacia registrada en Places con nombre muy distinto al del dataset podría no aparecer. → Riesgo muy bajo: Places es tolerante a keywords parciales y el prefijo de categoría solo filtra no-farmacias.
