## 1. Desacople de ubicación y ruta (base para todo lo demás)

- [x] 1.1 Agregar estado `routeActive` en `PharmacyAppContext` y condicionar `watchPosition` y `showDirections` a ese estado en lugar de `userLocation && selectedPharmacy`
- [x] 1.2 Crear acción `onRequestLocation()` que pide `getCurrentPosition` y setea `userLocation`/`locationStatus` sin tocar la ruta
- [x] 1.3 Ajustar `onGetDirections()` para reutilizar `userLocation` existente (sin nueva solicitud de permiso) y activar `routeActive`
- [x] 1.4 Ajustar `onCancelDirections()` para limpiar solo `routeOrigin`/`routeActive` y detener el watch, preservando `userLocation` y `distances`
- [x] 1.5 Verificar que seleccionar farmacia con ubicación concedida no traza ruta y que el punto azul persiste tras cancelar

## 2. Campo `shift` en el dominio

- [x] 2.1 Agregar `shift: 'overnight' | 'day'` a `PharmacyEnriched`, derivado del índice del payload original del día (0–1 = overnight) antes de cualquier reorden
- [x] 2.2 Reemplazar los usos de `index < 2` / `isDayOnly` en `Sidebar.tsx` por el campo `shift`

## 3. Nearby sorting (fila «Usar mi ubicación» + orden por cercanía)

- [x] 3.1 Renderizar la fila «Usar mi ubicación» sobre la lista cuando no hay `userLocation`, con estados loading («Obteniendo ubicación…») y error inline (denied/unavailable)
- [x] 3.2 Reemplazar la fila por el indicador «Ordenadas por cercanía» al conceder permiso
- [x] 3.3 Ordenar `pharmaciesForDate` por distancia ascendente cuando hay distancias (dentro de cada grupo horario si `isOvernightMix`), estable ante actualizaciones de GPS
- [x] 3.4 Verificar: sin ubicación mantiene orden del endpoint; con ubicación ordena; con mix ordena dentro de grupos

## 4. Route ETA (tiempos por modo + distancia en cancelar)

- [x] 4.1 Mover el cálculo de rutas de `DirectionsLayer` a un hook/estado compartido que pida WALKING y DRIVING al activar ruta y en cada re-ruteo, guardando `{result, duration, distance}` por modo
- [x] 4.2 `DirectionsLayer` pasa a solo renderizar el `DirectionsResult` del modo activo desde memoria (alternar modo no emite request)
- [x] 4.3 Convertir el selector de modo en control segmentado: solo íconos sin ruta activa, ícono + duración por modo con ruta activa («…» mientras pende), en mobile y desktop
- [x] 4.4 Mostrar la distancia de la ruta del modo activo en el botón «Cancelar recorrido · X»
- [x] 4.5 Verificar: activar ruta emite 2 requests, alternar modo es instantáneo, re-ruteo a 50 m actualiza ambos modos

## 5. Encabezados de sección en el mix nocturno

- [x] 5.1 Agrupar la lista bajo «Toda la noche · hasta las 09:00» y «Solo hasta las 23:00» durante el mix, usando el campo `shift`
- [x] 5.2 Quitar los chips de horario de los ítems de lista (queda solo distancia); conservar el badge de horario en el detail card
- [x] 5.3 Verificar: fuera de la ventana mix no hay encabezados; con orden por cercanía nadie cambia de grupo

## 6. Bottom sheet con 3 posiciones

- [x] 6.1 Implementar snap points mínima (~140 px) / media (~45 dvh, default) / completa (~85 dvh) en el sheet de modo lista
- [x] 6.2 Implementar drag desde el handle con pointer events (`touch-action: none`), snap al soltar con transición y variante sin animación para `prefers-reduced-motion`
- [x] 6.3 Tap en el handle alterna media ↔ completa; en posición mínima quedan visibles handle y selector de fecha
- [x] 6.4 Verificar en mobile real/emulado: scroll interno de la lista no mueve el sheet, modo card sin cambios

## 7. Fecha en URL y botón «Hoy»

- [x] 7.1 Leer `?fecha=` al inicializar el estado (validando contra `availableDates`, fallback silencioso a `mostRecentAvailable`)
- [x] 7.2 Actualizar `?fecha=` con `history.replaceState` en `onDateChange`
- [x] 7.3 Agregar botón «Hoy» junto al selector de fecha, visible cuando `selectedDate !== today`
- [x] 7.4 Verificar deep-link con fecha válida, inválida y navegación sin entradas de historial

## 8. Markup y accesibilidad

- [x] 8.1 Reestructurar el ítem de lista: `<div>` contenedor con `<button>` de selección y `<a href="tel:">` como hermanos (elimina el `<a>` anidado en `<button>`)
- [x] 8.2 Agregar `aria-pressed` a los segmentos del selector de modo
- [x] 8.3 Envolver los mensajes de estado de ubicación en región `aria-live="polite"`
- [x] 8.4 Agregar `aria-hidden="true"` a los SVG decorativos de `Sidebar.tsx` y `PharmacyMap.tsx`
- [x] 8.5 Agregar `color-scheme` y `<meta name="theme-color">` en `Layout.astro`, sincronizados con el toggle de tema
- [x] 8.6 Verificar con teclado y lector de pantalla: foco independiente en botón/teléfono, modo activo anunciado

## 9. Documentación

- [x] 9.1 Actualizar `docs/architecture.md` con el flujo de ubicación desacoplado, route ETA, snap points del sheet y fecha en URL
