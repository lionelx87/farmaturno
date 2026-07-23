# Tasks: improve-navigation-ux

## 1. Fixes rápidos de UI

- [x] 1.1 Estabilizar el botón «Cómo llegar»: estado loading con spinner + «Ubicando…» en una línea, `min-h` fijo, verificado en viewport de 320 px (`Sidebar.tsx` → `DirectionsActions`)
- [x] 1.2 Bajar `strokeOpacity` de la polilínea DRIVING a ~0.7 y validar visualmente la legibilidad de nombres de calles en tema claro y oscuro (`PharmacyMap.tsx` → `DirectionsLayer`)
- [x] 1.3 Separar etiqueta y acción del selector de fecha: etiqueta «Hoy» no interactiva solo cuando `selectedDate === today`, atajo «Ir a hoy» con semántica de acción en las demás fechas (`Sidebar.tsx` → `SidebarContent`)
- [x] 1.4 Eliminar la derivación UTC del piso de fechas (`toISOString()` en `availableDates`) reemplazándola por helper local, auditar el resto del manejo de fechas y verificar con reloj simulado a las 21:24 ART (`PharmacyAppContext.tsx`)

## 2. Proveedor de geolocalización y simulador

- [x] 2.1 Crear `src/lib/geolocation.ts` con la interfaz del proveedor (`getCurrentPosition`, `watchPosition`, `clearWatch`) y la implementación `browserGeolocation`; migrar `PharmacyAppContext` para consumir el proveedor en lugar de `navigator.geolocation`
- [x] 2.2 Implementar `simulatedGeolocation`: avance por `overview_path` de la ruta activa a velocidad por modo (30/5 km/h), fixes de 1 Hz con `heading`/`speed` sintéticos, activado solo con `?sim` en `import.meta.env.DEV`
- [x] 2.3 Agregar panel flotante de simulación: play/pausa, velocidad ×1/×4, desvío lateral on/off
- [x] 2.4 Probar con el simulador el flujo completo actual (recorrido, re-ruteo de 50 m) antes de construir lo nuevo

## 3. Distancias en vivo

- [x] 3.1 Actualizar `distanceOrigin` desde `watchPosition` cuando el desplazamiento supera 25 m durante recorrido activo (`PharmacyAppContext.tsx`)
- [x] 3.2 Congelar el criterio de orden de la lista mientras `routeActive` (los chips se actualizan, el orden no)
- [x] 3.3 Verificar con el simulador que los chips acompañan el desplazamiento y que la lista no salta

## 4. Snap a la ruta

- [x] 4.1 Crear utilidades de geometría en `src/lib/route-geometry.ts`: proyección de punto sobre polilínea (equirectangular), distancia de desvío y bearing entre puntos
- [x] 4.2 Exponer en contexto la posición snapeada (proyección si desvío < 30 m, cruda si no) y usarla para el marcador de usuario durante recorrido activo
- [x] 4.3 Verificar con el simulador (desvío lateral on/off) el snap y la vuelta a posición cruda

## 5. Modo Navegación

- [x] 5.1 Agregar estado `navigationMode` al contexto con entrada explícita («Iniciar navegación» en la tarjeta con recorrido activo) y salidas (banner, cancelar, llegada)
- [x] 5.2 Implementar `NavigationCamera` en `PharmacyMap.tsx`: `map.moveCamera({center, heading, zoom ~17.5, tilt 45})` por fix, heading desde GPS con fallback a bearing entre puntos snapeados y retención del último rumbo válido
- [x] 5.3 Suspender el follow ante gesto del usuario (`onCameraChanged`) y agregar chip «Recentrar» que lo reanuda
- [x] 5.4 Replegar UI en modo navegación: ocultar bottom sheet/tarjeta (mobile), colapsar sidebar a rail (desktop)
- [x] 5.5 Crear banner de navegación: farmacia destino, ETA y distancia del modo activo desde `routeResults`, botón de salida; restaurar cámara (norte, sin tilt) y UI al salir
- [x] 5.6 Recorrer una ruta completa con el simulador validando cámara, banner, recentrado y salidas del modo

## 6. Animación de llegada

- [x] 6.1 Detectar llegada en contexto: distancia al destino < 25 m en dos fixes consecutivos con recorrido activo, disparo único por recorrido
- [x] 6.2 Implementar la secuencia de arribo: zoom-in al destino, animación CSS de ondas expansivas + bounce del pin (con `motion-safe`), banner «Llegaste a {farmacia}»
- [x] 6.3 Cierre limpio tras ~4 s o tap: finalizar recorrido y modo navegación reutilizando la lógica de cancelación, preservando `userLocation` y distancias
- [x] 6.4 Verificar la llegada de punta a punta con el simulador (incluida la variante `prefers-reduced-motion`)

## 7. Cierre

- [x] 7.1 Actualizar `docs/architecture.md` (modo navegación, snap, simulador, proveedor de geolocalización) y `CLAUDE.md` si cambia la estructura de `src/lib/`
- [x] 7.2 Ejecutar `openspec validate improve-navigation-ux` y dejar el change listo para archivar
