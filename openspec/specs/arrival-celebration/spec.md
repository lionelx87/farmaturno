# arrival-celebration Specification

## Purpose
TBD - created by archiving change improve-navigation-ux. Update Purpose after archive.
## Requirements
### Requirement: Detección de llegada al destino
Con un recorrido activo, el sistema SHALL detectar la llegada cuando la distancia al destino es menor a 25 m en dos actualizaciones de posición consecutivas. La detección SHALL dispararse una única vez por recorrido.

#### Scenario: Llegada detectada
- **WHEN** dos fixes consecutivos reportan distancia al destino menor a 25 m durante un recorrido activo
- **THEN** el sistema entra en estado de llegada

#### Scenario: Paso fugaz cerca del destino
- **WHEN** un único fix reporta distancia menor a 25 m y el siguiente vuelve a superarla
- **THEN** el sistema no entra en estado de llegada

### Requirement: Animación de arribo
Al detectar la llegada, el sistema SHALL centrar la cámara en el destino con acercamiento suave y SHALL reproducir una animación de celebración sobre el pin destino (ondas expansivas y rebote), junto con un mensaje «Llegaste a {farmacia}». La animación SHALL respetar `prefers-reduced-motion`.

#### Scenario: Secuencia de llegada
- **WHEN** se detecta la llegada a la farmacia destino
- **THEN** la cámara centra el destino, el pin reproduce la animación de celebración y se muestra el mensaje de llegada

#### Scenario: Usuario con movimiento reducido
- **WHEN** el sistema operativo indica `prefers-reduced-motion`
- **THEN** se muestra el mensaje de llegada sin animaciones de ondas ni rebote

### Requirement: Cierre limpio del recorrido tras la llegada
Tras la animación de llegada (o al descartarla con un tap), el sistema SHALL finalizar el recorrido y el modo navegación reutilizando la lógica de cancelación existente: detener el rastreo GPS, limpiar la ruta y restaurar la UI, preservando `userLocation` y las distancias.

#### Scenario: Cierre automático
- **WHEN** la animación de llegada termina sin interacción del usuario
- **THEN** el recorrido y el modo navegación finalizan y la UI se restaura con la farmacia aún seleccionada

#### Scenario: Cierre por tap
- **WHEN** el usuario toca el mensaje de llegada antes de que termine
- **THEN** el recorrido finaliza de inmediato con el mismo comportamiento
