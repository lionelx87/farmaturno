# directions-cancel Specification

## Purpose
TBD - created by archiving change directions-cancel-button. Update Purpose after archive.
## Requirements
### Requirement: Botón muta según estado del recorrido
El sistema SHALL mostrar el botón "Cómo llegar" cuando no hay recorrido activo (`routeOrigin === null`), y el botón "Cancelar recorrido" cuando hay un recorrido activo (`routeOrigin !== null`).

#### Scenario: Sin recorrido activo
- **WHEN** la tarjeta de detalle de una farmacia con coordenadas está visible y `routeOrigin === null`
- **THEN** se muestra el botón "Cómo llegar" con estilo verde relleno

#### Scenario: Con recorrido activo
- **WHEN** la tarjeta de detalle de una farmacia con coordenadas está visible y `routeOrigin !== null`
- **THEN** se muestra el botón "Cancelar recorrido" con estilo outline neutro (sin fondo de color)

### Requirement: Cancelar recorrido limpia el estado de navegación
Al presionar "Cancelar recorrido", el sistema SHALL limpiar `routeOrigin`, detener el `watchPosition` y resetear `locationStatus` a `idle`. El sistema SHALL mantener `userLocation` y `distances` sin modificación: el punto azul del usuario y los chips de distancia persisten tras cancelar.

#### Scenario: Usuario cancela el recorrido
- **WHEN** el usuario presiona "Cancelar recorrido"
- **THEN** el recorrido desaparece del mapa, el rastreo GPS se detiene y el botón vuelve a mostrar "Cómo llegar"

#### Scenario: Distancias se preservan al cancelar
- **WHEN** el usuario presiona "Cancelar recorrido"
- **THEN** las distancias calculadas permanecen disponibles en el contexto

#### Scenario: Ubicación del usuario se preserva al cancelar
- **WHEN** el usuario presiona "Cancelar recorrido"
- **THEN** el punto azul permanece en el mapa y un nuevo "Cómo llegar" no vuelve a pedir permiso de ubicación

### Requirement: Modos de viaje siempre visibles con coordenadas
Los botones de modo de viaje (a pie / en auto) SHALL permanecer visibles en la tarjeta de detalle cuando la farmacia tiene coordenadas, independientemente del estado del recorrido.

#### Scenario: Modos visibles antes de pedir recorrido
- **WHEN** la tarjeta de detalle está visible y `routeOrigin === null`
- **THEN** los botones de modo de viaje están visibles y funcionales

#### Scenario: Modos visibles con recorrido activo
- **WHEN** la tarjeta de detalle está visible y `routeOrigin !== null`
- **THEN** los botones de modo de viaje están visibles y funcionales junto al botón "Cancelar recorrido"

### Requirement: La ruta solo se activa por acción explícita
El sistema SHALL trazar un recorrido únicamente como consecuencia de "Cómo llegar". La existencia simultánea de `userLocation` y una farmacia seleccionada SHALL NOT activar un recorrido por sí sola.

#### Scenario: Seleccionar farmacia con ubicación concedida no traza ruta
- **WHEN** el usuario ya concedió ubicación y selecciona una farmacia de la lista
- **THEN** el mapa centra la farmacia sin dibujar ningún recorrido

#### Scenario: Cómo llegar reutiliza la ubicación existente
- **WHEN** el usuario ya concedió ubicación y presiona "Cómo llegar"
- **THEN** el recorrido se traza de inmediato sin nueva solicitud de permiso

### Requirement: Layout estable del botón de recorrido
El botón «Cómo llegar» SHALL mantener dimensiones estables en todos sus estados. Durante la obtención de ubicación, el botón SHALL mostrar un indicador de progreso con un texto corto en una sola línea («Ubicando…»), sin desbordar ni romper la fila que comparte con el selector de modo de viaje en ninguna resolución soportada.

#### Scenario: Estado de carga sin quiebre visual
- **WHEN** el usuario toca «Cómo llegar» y la ubicación está siendo obtenida
- **THEN** el botón muestra spinner y «Ubicando…» en una línea, conservando la altura y sin desbordar la fila

#### Scenario: Pantalla angosta
- **WHEN** el estado de carga se muestra en un viewport angosto (~320 px)
- **THEN** el botón y el selector de modo permanecen alineados en la misma fila sin overflow horizontal

