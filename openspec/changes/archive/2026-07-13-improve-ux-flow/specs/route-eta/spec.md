## ADDED Requirements

### Requirement: Cálculo de ruta para ambos modos de viaje
Al activarse un recorrido (y en cada re-ruteo por desplazamiento), el sistema SHALL solicitar la ruta a Google Directions para ambos modos (WALKING y DRIVING) y conservar los resultados en memoria. Alternar el modo activo SHALL reutilizar el resultado en memoria sin emitir un nuevo request.

#### Scenario: Activación del recorrido pide ambos modos
- **WHEN** el usuario toca «Cómo llegar» con ubicación disponible
- **THEN** se solicitan las rutas WALKING y DRIVING y se almacenan duración y distancia de cada una

#### Scenario: Alternar modo no genera request
- **WHEN** el usuario alterna entre a pie y en auto con recorrido activo
- **THEN** el mapa muestra la ruta del nuevo modo desde memoria, sin nueva solicitud a Google

#### Scenario: Re-ruteo actualiza ambos modos
- **WHEN** el usuario se desplaza más del umbral de re-ruteo (50 m) con recorrido activo
- **THEN** se vuelven a solicitar ambas rutas desde la nueva posición

### Requirement: Selector segmentado con tiempo por modo
Con recorrido activo, el selector de modo de viaje SHALL mostrar la duración estimada de cada modo junto a su ícono (p. ej. «🚶 5 min | 🚗 2 min»). Mientras un resultado está pendiente, el sistema SHALL mostrar «…» en su lugar. Sin recorrido activo, el selector SHALL mostrar solo los íconos.

#### Scenario: Tiempos visibles con recorrido activo
- **WHEN** hay recorrido activo y ambos resultados de ruta disponibles
- **THEN** cada segmento del selector muestra ícono y duración de su modo

#### Scenario: Resultado pendiente
- **WHEN** hay recorrido activo y la ruta de un modo aún no respondió
- **THEN** ese segmento muestra «…» hasta recibir el resultado

#### Scenario: Sin recorrido activo
- **WHEN** no hay recorrido activo
- **THEN** el selector muestra solo los íconos de a pie y en auto

### Requirement: Distancia del recorrido en el botón de cancelar
Con recorrido activo, el botón «Cancelar recorrido» SHALL mostrar la distancia real de la ruta del modo activo (p. ej. «Cancelar recorrido · 400 m»).

#### Scenario: Distancia de la ruta visible
- **WHEN** hay recorrido activo con resultado disponible para el modo activo
- **THEN** el botón de cancelar incluye la distancia de esa ruta

#### Scenario: Cambio de modo actualiza la distancia
- **WHEN** el usuario alterna el modo de viaje con recorrido activo
- **THEN** la distancia mostrada en el botón de cancelar corresponde al nuevo modo
