# Design: improve-navigation-ux

## Context

La prueba de campo en auto expuso que la app funciona bien como «consulta estática» pero se queda corta como acompañante de viaje. El estado actual relevante:

- `PharmacyAppContext` ya tiene `watchPosition` activo durante un recorrido (`routeActive`), con re-ruteo al superar 50 m (`REROUTE_THRESHOLD_METERS`). Los tiempos del selector a pie/auto sí se actualizan en movimiento, pero `distanceOrigin` (origen de los chips de distancia) solo se setea una vez en `acquireLocation`.
- El mapa es vectorial (`PUBLIC_GOOGLE_MAP_ID`), por lo que `heading`/`tilt` están disponibles sin cambios de infraestructura.
- La cámara se maneja de forma no controlada (`defaultCenter`/`defaultZoom`) más `panTo` imperativo en `MapCenterer`.
- La spec `nearby-sorting` hoy exige explícitamente que el reorden **no** siga al GPS; este change modifica ese requirement.
- El pill «Hoy» del selector de fecha es un botón-atajo que aparece junto a cualquier fecha distinta de hoy, pero visualmente se lee como etiqueta («Miércoles [Hoy]» a las 21:24 del martes).

## Goals / Non-Goals

**Goals:**
- Layout estable del botón «Cómo llegar» en todos sus estados.
- Nombres de calles legibles bajo la polilínea de ruta.
- Chips de distancia que acompañan el desplazamiento durante un recorrido activo.
- Indicador «Hoy» sin ambigüedad y fecha local sin fugas de UTC.
- Modo Navegación inmersivo: cámara con rumbo/tilt, UI replegada, banner de estado.
- Punto de usuario proyectado sobre la ruta (snap) durante el recorrido.
- Animación de llegada al destino.
- Simulador de desplazamiento para desarrollo.

**Non-Goals:**
- Navegación giro-a-giro con instrucciones de voz o lista de maniobras.
- Snap-to-road fuera de un recorrido activo (sin ruta no hay polilínea de referencia).
- Persistir el modo navegación entre recargas de página.
- Reordenar la lista en vivo durante el recorrido (los chips se actualizan; el orden queda congelado para evitar saltos de UI).

## Decisions

### D1 — Botón «Cómo llegar»: layout reservado, no texto elástico

El quiebre se produce porque «Obteniendo ubicación…» es más largo que «Cómo llegar» y el botón (`flex-1`) convive con el selector de modo (`shrink-0`) en la misma fila. Decisión: el estado loading muestra un spinner + texto corto («Ubicando…») con `whitespace-nowrap`, y el botón fija `min-h` para que ningún estado cambie su altura.

*Alternativa considerada*: `min-width` calculado para el texto largo — descartada, en pantallas angostas fuerza overflow horizontal; acortar el contenido es más robusto que reservar espacio para el peor caso.

### D2 — Legibilidad de calles: polilínea semitransparente

En mapas vectoriales la polilínea de `DirectionsRenderer` se dibuja por encima de las etiquetas del mapa base y no hay control de z-order respecto de labels. Decisión: bajar `strokeOpacity` de la ruta DRIVING a ~0.7 (manteniendo `strokeWeight` 5) para que los nombres de calles se lean a través de la línea. El modo WALKING (punteado) ya deja pasar las etiquetas.

*Alternativa considerada*: doble polilínea con casing (borde oscuro + relleno claro estilo Google) — más vistosa pero igual tapa las etiquetas; puede combinarse a futuro.

### D3 — Distancias en vivo: `distanceOrigin` alimentado por el watch, con umbral propio

Decisión: durante un recorrido activo, cada posición del `watchPosition` que se aleje más de 25 m del último `distanceOrigin` actualiza `distanceOrigin`, recalculando los chips de todas las farmacias (haversine local, costo cero en red). El orden de la lista no cambia mientras `routeActive` (se congela el criterio de orden al iniciar el recorrido).

*Alternativa considerada*: recalcular en cada fix del GPS — descartada, produce parpadeo de chips a ~1 Hz sin valor perceptible; 25 m ≈ el mínimo cambio que altera un label («~850 m»).

### D4 — «Hoy»: etiqueta y atajo son cosas distintas + fecha 100 % local

**Causa raíz confirmada por captura**: a las 21:24 del martes, con el selector en «Miércoles 22», el pill «HOY» visible era el botón-atajo de regreso (aparece junto a cualquier fecha ≠ hoy), leído como etiqueta «este día es hoy». La lógica de fecha era correcta; el problema es semántico.

Dos correcciones:
1. **Semántica (el fix principal)**: cuando `selectedDate === today`, junto a la fecha se muestra una **etiqueta** no interactiva «Hoy». Cuando `selectedDate !== today`, el atajo pasa a leerse como **acción** («Ir a hoy», estilo botón con ícono), eliminando la lectura errónea «Miércoles = hoy».
2. **Timezone (higiene preventiva)**: `availableDates` calcula el piso de 7 días con `toISOString()` (UTC). A las 21:00+ hora argentina ya es «mañana» en UTC. Se reemplaza toda derivación de fechas por helpers locales (`localToday`-style) y se audita que ninguna ruta de código use UTC para fechas de calendario.

*Alternativa considerada*: mantener un solo pill y cambiar solo el color — descartada, el problema es semántico (badge vs. acción), no cromático.

### D5 — Snap a la ruta: proyección geométrica local sobre la polilínea

Decisión: nuevo helper `snapToRoute(position, path)` que proyecta la posición sobre cada segmento de la polilínea activa (aproximación equirectangular, suficiente a escala urbana) y devuelve el punto proyectado, el índice de segmento y la distancia de desvío. Si el desvío es < 30 m, el marcador de usuario se renderiza en el punto proyectado; si no, en la posición cruda (el usuario realmente se salió de la ruta, y el re-ruteo de 50 m ya existente se encarga). El path se obtiene de `routes[0].overview_path` del `DirectionsResult` en memoria.

*Alternativa considerada*: Google Roads API (snap-to-road real) — descartada, requiere API adicional facturada y red en cada fix; la proyección local es determinística, gratis y offline.

### D6 — Modo Navegación: estado explícito + cámara imperativa

**Entrada/salida**: con recorrido activo aparece un botón prominente «Iniciar navegación». Activa `navigationMode` en el contexto. Se sale con el botón del banner, al cancelar el recorrido, o automáticamente al llegar. No se entra automáticamente al trazar la ruta: trazar es «ver el recorrido» (overview), navegar es opt-in.

**Cámara**: componente `NavigationCamera` dentro del `<Map>` que usa `useMap()` + `map.moveCamera({center, heading, zoom: ~17.5, tilt: 45})` en cada fix. Se mantiene el mapa no controlado — `moveCamera` imperativo evita el ciclo render de props controladas y es la vía documentada para animación fluida en vis.gl.

**Heading**: `coords.heading` del GPS cuando `coords.speed > 1 m/s`; caso contrario, bearing entre los dos últimos puntos snapeados; si no hay desplazamiento, se conserva el último heading (evita brújula loca en semáforos).

**Gestos**: `onCameraChanged` con origen en gesto del usuario suspende el follow; aparece chip «Recentrar» que lo reanuda.

**UI**: en modo navegación el bottom sheet (mobile) y la tarjeta de detalle se ocultan; se muestra un banner superior con nombre de la farmacia, ETA y distancia del modo activo (datos ya presentes en `routeResults`), y botón de salida. En desktop el sidebar se colapsa a un rail mínimo.

*Alternativa considerada*: props de cámara controladas (`center`/`heading` como estado React) — descartada, re-render por fix de GPS y jitter documentado; `moveCamera` interpola mejor.

### D7 — Llegada: detección por proximidad sostenida + animación CSS

Decisión: con recorrido activo, si la distancia (snapeada o cruda) al destino es < 25 m en dos fixes consecutivos, se dispara `arrivalState`. Secuencia: la cámara centra el destino con zoom-in suave, el pin destino ejecuta una animación de celebración (ondas expansivas concéntricas + bounce del pin, CSS/Tailwind con `motion-safe`), banner «Llegaste a {farmacia}», y tras ~4 s (o tap) se cierra el recorrido limpiamente reutilizando la lógica de `onCancelDirections`.

*Alternativa considerada*: confetti con canvas/librería — descartada como dependencia nueva; las ondas CSS logran el efecto «Google Maps» sin sumar peso al island.

### D8 — Simulador: proveedor de geolocalización inyectable

Decisión: abstraer la geolocalización en `src/lib/geolocation.ts` con la interfaz `{ getCurrentPosition, watchPosition, clearWatch }`. Implementaciones: `browserGeolocation` (delegado a `navigator.geolocation`) y `simulatedGeolocation`. El contexto consume el provider, nunca `navigator` directo.

La simulación se activa con `?sim` en la URL **solo en `import.meta.env.DEV`**. El provider simulado:
- Parte de un punto configurable (default: centro de Bariloche) para la posición inicial.
- Al activarse un recorrido, avanza a lo largo de `overview_path` de la ruta activa a velocidad configurable (default 30 km/h en DRIVING, 5 km/h en WALKING), emitiendo fixes cada segundo con `heading`/`speed` sintéticos coherentes.
- Panel flotante mínimo (play/pausa, velocidad ×1/×4, desvío lateral on/off para probar el snap y el re-ruteo).

*Alternativa considerada*: override de `navigator.geolocation` vía monkey-patching o extensión del navegador — descartada, frágil y no versionable; el provider inyectable además deja la puerta abierta a tests.

## Risks / Trade-offs

- [El heading del GPS es ruidoso a baja velocidad] → umbral de velocidad + fallback a bearing entre puntos + conservar último heading válido.
- [`moveCamera` en cada fix puede sentirse brusco con fixes irregulares] → los fixes reales llegan ~1 Hz y `moveCamera` interpola; si se percibe jitter, interpolar posiciones intermedias con rAF queda como mejora incremental.
- [Actualizar chips en movimiento re-renderiza la lista] → los chips leen de `distances` (objeto nuevo por update); el throttle de 25 m limita la frecuencia; la lista es de ≤4 items, costo despreciable.
- [Snap < 30 m puede «pegar» el punto a una calle paralela en cuadras cortas] → el umbral es conservador y el desvío real >30 m muestra posición cruda; el re-ruteo de 50 m corrige la ruta.
- [Bajar opacidad de la ruta reduce su contraste en dark mode] → validar visualmente 0.7 en ambos temas; ajustar por tema si hace falta.

## Open Questions

- ¿El botón «Iniciar navegación» reemplaza a «Cancelar recorrido» en la tarjeta o convive con él? (Propuesta: convive — navegación arriba, cancelar debajo.)
- ¿Zoom/tilt del modo navegación fijos (17.5/45°) o dependientes de la velocidad? (Propuesta inicial: fijos; dinámico como mejora futura.)
