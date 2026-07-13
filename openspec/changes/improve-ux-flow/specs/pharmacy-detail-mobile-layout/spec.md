## MODIFIED Requirements

### Requirement: Toggle de modo de viaje inline con botón de navegación
El selector de modo de viaje (a pie / en auto) SHALL aparecer en la misma fila que el botón "Cómo llegar" / "Cancelar recorrido", a su izquierda, como control segmentado. Sin recorrido activo SHALL mostrar solo los íconos; con recorrido activo SHALL mostrar la duración estimada de cada modo según la capacidad `route-eta`.

#### Scenario: Selección de modo de viaje
- **WHEN** el usuario toca un segmento del selector (a pie o en auto)
- **THEN** el modo queda activo y la ruta mostrada corresponde a ese modo

#### Scenario: Selector con tiempos durante el recorrido
- **WHEN** hay recorrido activo con resultados disponibles
- **THEN** cada segmento muestra ícono y duración de su modo en la misma fila que el botón de cancelar

## REMOVED Requirements

### Requirement: Layout desktop sin cambios
**Reason**: Superseded — el detail card de desktop adopta el mismo selector segmentado con tiempos por modo, por lo que ya no permanece idéntico al estado previo.
**Migration**: El comportamiento del selector queda definido por la capacidad `route-eta` y aplica a ambos layouts (mobile y desktop).
