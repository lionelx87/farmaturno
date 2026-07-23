# directions-cancel Delta Spec

## ADDED Requirements

### Requirement: Layout estable del botón de recorrido
El botón «Cómo llegar» SHALL mantener dimensiones estables en todos sus estados. Durante la obtención de ubicación, el botón SHALL mostrar un indicador de progreso con un texto corto en una sola línea («Ubicando…»), sin desbordar ni romper la fila que comparte con el selector de modo de viaje en ninguna resolución soportada.

#### Scenario: Estado de carga sin quiebre visual
- **WHEN** el usuario toca «Cómo llegar» y la ubicación está siendo obtenida
- **THEN** el botón muestra spinner y «Ubicando…» en una línea, conservando la altura y sin desbordar la fila

#### Scenario: Pantalla angosta
- **WHEN** el estado de carga se muestra en un viewport angosto (~320 px)
- **THEN** el botón y el selector de modo permanecen alineados en la misma fila sin overflow horizontal
