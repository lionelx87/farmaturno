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
Al presionar "Cancelar recorrido", el sistema SHALL limpiar `routeOrigin` y `userLocation`, detener el `watchPosition` y resetear `locationStatus` a `idle`. El sistema SHALL mantener `distances` sin modificación.

#### Scenario: Usuario cancela el recorrido
- **WHEN** el usuario presiona "Cancelar recorrido"
- **THEN** el recorrido desaparece del mapa, el rastreo GPS se detiene y el botón vuelve a mostrar "Cómo llegar"

#### Scenario: Distancias se preservan al cancelar
- **WHEN** el usuario presiona "Cancelar recorrido"
- **THEN** las distancias calculadas permanecen disponibles en el contexto

### Requirement: Modos de viaje siempre visibles con coordenadas
Los botones de modo de viaje (a pie / en auto) SHALL permanecer visibles en la tarjeta de detalle cuando la farmacia tiene coordenadas, independientemente del estado del recorrido.

#### Scenario: Modos visibles antes de pedir recorrido
- **WHEN** la tarjeta de detalle está visible y `routeOrigin === null`
- **THEN** los botones de modo de viaje están visibles y funcionales

#### Scenario: Modos visibles con recorrido activo
- **WHEN** la tarjeta de detalle está visible y `routeOrigin !== null`
- **THEN** los botones de modo de viaje están visibles y funcionales junto al botón "Cancelar recorrido"
