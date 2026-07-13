## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: La ruta solo se activa por acción explícita
El sistema SHALL trazar un recorrido únicamente como consecuencia de "Cómo llegar". La existencia simultánea de `userLocation` y una farmacia seleccionada SHALL NOT activar un recorrido por sí sola.

#### Scenario: Seleccionar farmacia con ubicación concedida no traza ruta
- **WHEN** el usuario ya concedió ubicación y selecciona una farmacia de la lista
- **THEN** el mapa centra la farmacia sin dibujar ningún recorrido

#### Scenario: Cómo llegar reutiliza la ubicación existente
- **WHEN** el usuario ya concedió ubicación y presiona "Cómo llegar"
- **THEN** el recorrido se traza de inmediato sin nueva solicitud de permiso
