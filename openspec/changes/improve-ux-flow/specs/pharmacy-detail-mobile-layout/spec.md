## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Layout desktop sin cambios
**Reason**: Superseded — el detail card de desktop adopta el mismo selector segmentado con tiempos por modo, por lo que ya no permanece idéntico al estado previo.
**Migration**: El comportamiento del selector queda definido por la capacidad `route-eta` y aplica a ambos layouts (mobile y desktop).
