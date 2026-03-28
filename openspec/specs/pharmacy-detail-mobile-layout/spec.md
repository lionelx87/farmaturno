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
El toggle de modo de viaje (a pie / en auto) SHALL aparecer en la misma fila que el botón "Cómo llegar", a su izquierda, en lugar de en una columna separada.

#### Scenario: Selección de modo de viaje
- **WHEN** el usuario toca el ícono de modo de viaje (🚶 o 🚗)
- **THEN** el modo queda activo y el botón "Cómo llegar" usa ese modo al calcular la ruta

### Requirement: Layout desktop sin cambios
El layout de `PharmacyDetailCard` en desktop SHALL permanecer idéntico al estado previo a este cambio.

#### Scenario: Renderizado en sidebar desktop
- **WHEN** el card se renderiza dentro del sidebar de desktop
- **THEN** mantiene el layout en dos columnas con toggle a la derecha y teléfono inline entre los badges
