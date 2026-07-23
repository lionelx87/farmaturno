# Proposal: improve-navigation-ux

## Why

Una prueba de campo real (recorrido en auto por las 3 farmacias de turno) expuso ocho fricciones concretas: roturas visuales, datos que no se actualizan en movimiento, un badge de fecha engañoso y una experiencia de navegación plana comparada con lo que el usuario espera de un mapa moderno (rotación, feedback de llegada, modo navegación). Además, probar estos flujos hoy requiere salir físicamente a la calle, lo que hace el ciclo de desarrollo lentísimo.

## What Changes

- **Fix layout del botón «Cómo llegar»**: el estado «Obteniendo ubicación…» rompe visualmente el botón en algunas resoluciones; el layout debe ser estable en todos los estados.
- **Legibilidad de nombres de calles**: la polilínea de ruta (DRIVING) tapa los nombres de las calles; ajustar el estilo para que sigan siendo legibles.
- **Distancias en vivo**: los chips de distancia se calculan una sola vez al obtener ubicación; deben actualizarse mientras el usuario se desplaza con recorrido activo (como ya hacen los tiempos del selector a pie/auto).
- **Badge «Hoy» correcto y sin ambigüedad**: el pill «Hoy» aparece junto a fechas que no son hoy (es un atajo, pero se lee como etiqueta), y hay que auditar el manejo de timezone cerca de la medianoche UTC (21:00+ hora argentina).
- **Animación de llegada**: al llegar físicamente a la farmacia destino, presentar una animación de arribo (estilo Google Maps) en lugar de que el puntito simplemente se superponga al pin.
- **Snap del punto de ubicación a la ruta**: proyectar la posición GPS sobre la polilínea de la ruta activa cuando el error es pequeño, para que el puntito no «flote» fuera de la calle.
- **Modo Navegación**: al iniciar un recorrido, entrar en un modo inmersivo con cámara que sigue al usuario (rotación según rumbo, tilt), drawer/sidebar replegado y un banner persistente con destino, ETA y salida del modo.
- **Simulador de desplazamiento**: herramienta de desarrollo que reproduce movimiento a lo largo de la ruta calculada, para probar todo lo anterior sin salir a la calle.

## Capabilities

### New Capabilities

- `navigation-mode`: modo navegación inmersivo durante un recorrido activo — cámara que sigue la posición con heading/tilt, UI replegada, banner de estado con destino y ETA, entrada/salida explícita del modo.
- `route-snapping`: proyección de la posición GPS sobre la polilínea de la ruta activa cuando la desviación es menor a un umbral, para que el marcador de usuario se mantenga sobre la calle.
- `arrival-celebration`: detección de llegada al destino (proximidad durante recorrido activo) y animación de arribo con cierre limpio del recorrido.
- `route-legibility`: estilo de la polilínea de ruta que preserva la legibilidad de los nombres de calles del mapa base.
- `today-indicator`: semántica correcta y no ambigua del indicador «Hoy» en el selector de fecha, con manejo de fecha local consistente (sin fugas de UTC).
- `location-simulation`: modo de simulación de desplazamiento (solo desarrollo) que alimenta la app con posiciones sintéticas a lo largo de la ruta activa.

### Modified Capabilities

- `nearby-sorting`: el requirement «El reorden no sigue al GPS en tiempo real» cambia — los chips de distancia SHALL actualizarse con el desplazamiento durante un recorrido activo (con throttle); el orden de la lista permanece estable durante el recorrido para evitar saltos.
- `directions-cancel`: nuevo requirement de layout estable — el botón «Cómo llegar» SHALL mantener sus dimensiones y no romper el layout cuando muta al estado «Obteniendo ubicación…».

## Impact

- **Código afectado**:
  - `src/components/PharmacyAppContext.tsx` — distancias en vivo, estado de modo navegación, detección de llegada, snap, origen de geolocalización inyectable.
  - `src/components/PharmacyMap.tsx` — control de cámara (heading/tilt/follow), estilo de polilínea, animación de llegada, marcador de usuario.
  - `src/components/Sidebar.tsx` — fix layout botón, badge «Hoy», UI replegada en modo navegación, banner de navegación.
  - `src/lib/` — nuevo módulo de geolocalización (real + simulada) y utilidades de geometría (proyección sobre polilínea, bearing).
- **Dependencias**: sin librerías nuevas; se usa la `geometry` library de Google Maps JS API (ya disponible vía `useMapsLibrary`). La rotación de cámara requiere mapa vectorial, ya garantizado por `PUBLIC_GOOGLE_MAP_ID`.
- **Specs**: 6 capabilities nuevas, 2 modificadas (`nearby-sorting`, `directions-cancel`).
- **Riesgos**: consumo de batería/requests por updates frecuentes (mitigar con throttle y umbrales); `heading` de GPS poco confiable a baja velocidad (mitigar calculando bearing entre posiciones sucesivas).
