# nearby-sorting Delta Spec

## ADDED Requirements

### Requirement: Actualización de distancias en movimiento
Durante un recorrido activo, el sistema SHALL recalcular las distancias de todas las farmacias con coordenadas cada vez que la posición del usuario se aleja más de 25 m del último origen de cálculo, actualizando los chips «~X m/km» visibles.

#### Scenario: Chips actualizados durante el desplazamiento
- **WHEN** el usuario se desplaza más de 25 m con un recorrido activo
- **THEN** los chips de distancia de todas las farmacias reflejan la nueva posición

#### Scenario: Desplazamiento menor al umbral
- **WHEN** las actualizaciones de GPS se mantienen dentro de los 25 m del último origen
- **THEN** los chips de distancia no se recalculan

## MODIFIED Requirements

### Requirement: Orden por cercanía
Con distancias disponibles, el sistema SHALL ordenar la lista de farmacias por distancia ascendente. Durante el mix nocturno, el orden por distancia SHALL aplicarse dentro de cada grupo horario, manteniendo la agrupación como criterio primario. Sin ubicación, la lista SHALL mantener el orden original del endpoint. Durante un recorrido activo, el orden de la lista SHALL permanecer congelado aunque las distancias se actualicen con el desplazamiento.

#### Scenario: Lista ordenada por cercanía sin mix
- **WHEN** hay ubicación concedida y no hay mix nocturno
- **THEN** la lista completa se ordena de la farmacia más cercana a la más lejana

#### Scenario: Orden dentro de grupos durante el mix
- **WHEN** hay ubicación concedida y `isOvernightMix === true`
- **THEN** cada grupo horario ordena sus farmacias por distancia, sin mezclar farmacias entre grupos

#### Scenario: Sin ubicación no hay reorden
- **WHEN** el usuario no concedió ubicación
- **THEN** la lista mantiene el orden original del endpoint

#### Scenario: El orden se congela durante el recorrido activo
- **WHEN** los chips de distancia se actualizan por desplazamiento durante un recorrido activo
- **THEN** el orden de la lista no cambia hasta finalizar o cancelar el recorrido
