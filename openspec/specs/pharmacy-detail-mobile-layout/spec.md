## Requirements
### Requirement: Zona de datos separada de zona de acciones
El card de detalle en mobile SHALL presentar nombre, dirección y badges en una zona superior separada visualmente de las acciones (teléfono, navegación) mediante dividers de ancho completo.

#### Scenario: Visualización con todos los datos disponibles
- **WHEN** el usuario selecciona una farmacia con teléfono y coordenadas
- **THEN** el card muestra: zona de datos (nombre + dirección + badges) → divider → fila de teléfono → divider → fila de navegación

#### Scenario: Visualización sin teléfono
- **WHEN** el usuario selecciona una farmacia sin teléfono registrado
- **THEN** el card omite la fila de teléfono y su divider, mostrando solo zona de datos y fila de navegación (si tiene coordenadas)

#### Scenario: Visualización sin coordenadas
- **WHEN** el usuario selecciona una farmacia sin coordenadas
- **THEN** el card omite la fila de navegación y su divider

### Requirement: Teléfono como fila tappable full-width
El teléfono SHALL presentarse como una fila de ancho completo con `href="tel:"`, visualmente distinguible como acción primaria, con área táctil adecuada para mobile.

#### Scenario: Tap en fila de teléfono
- **WHEN** el usuario toca la fila de teléfono
- **THEN** el dispositivo inicia una llamada al número de la farmacia

### Requirement: Toggle de modo de viaje inline con botón de navegación
El selector de modo de viaje (a pie / en auto) SHALL presentarse como control segmentado. Sin recorrido activo SHALL mostrar solo los íconos, en la misma fila que el botón "Cómo llegar". Con recorrido activo SHALL mostrar la duración estimada de cada modo según la capacidad `route-eta`, ocupando su propia fila a ancho completo, con el botón "Cancelar recorrido" a ancho completo debajo (evita el wrap del texto del botón).

#### Scenario: Selección de modo de viaje
- **WHEN** el usuario toca un segmento del selector (a pie o en auto)
- **THEN** el modo queda activo y la ruta mostrada corresponde a ese modo

#### Scenario: Selector compacto sin recorrido
- **WHEN** no hay recorrido activo
- **THEN** el selector muestra solo íconos junto al botón "Cómo llegar" en una única fila

#### Scenario: Selector con tiempos durante el recorrido
- **WHEN** hay recorrido activo con resultados disponibles
- **THEN** el selector ocupa una fila completa con ícono y duración por modo, y el botón de cancelar aparece debajo a ancho completo sin salto de línea en su texto

