# route-legibility Delta Spec

## ADDED Requirements

### Requirement: Nombres de calles legibles bajo la ruta
La polilínea del recorrido en modo DRIVING SHALL renderizarse con opacidad parcial (~0.7) de modo que los nombres de calles del mapa base permanezcan legibles a través de la línea, en tema claro y oscuro.

#### Scenario: Ruta sobre calle con nombre
- **WHEN** la polilínea DRIVING pasa sobre el nombre de una calle
- **THEN** el nombre permanece legible a través de la línea

#### Scenario: Legibilidad en dark mode
- **WHEN** el recorrido se muestra con el tema oscuro activo
- **THEN** la ruta mantiene contraste suficiente y los nombres de calles siguen siendo legibles
