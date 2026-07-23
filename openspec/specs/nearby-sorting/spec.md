# nearby-sorting Specification

## Purpose
TBD - created by archiving change improve-ux-flow. Update Purpose after archive.
## Requirements
### Requirement: Fila «Usar mi ubicación» sobre la lista
El sistema SHALL mostrar una fila «Usar mi ubicación» sobre la lista de farmacias cuando no existe `userLocation` y `locationStatus === 'idle'`. Al activarla, el sistema SHALL solicitar la geolocalización del navegador sin requerir una farmacia seleccionada.

#### Scenario: Fila visible sin ubicación concedida
- **WHEN** el usuario abre la app y no concedió ubicación
- **THEN** la fila «Usar mi ubicación» aparece sobre la lista de farmacias

#### Scenario: Solicitud de ubicación en curso
- **WHEN** el usuario toca «Usar mi ubicación» y la solicitud está en curso
- **THEN** la fila muestra «Obteniendo ubicación…» y no puede reactivarse

#### Scenario: Permiso concedido
- **WHEN** el navegador devuelve la posición del usuario
- **THEN** la fila desaparece y se reemplaza por el indicador «Ordenadas por cercanía»

#### Scenario: Permiso denegado
- **WHEN** el usuario deniega el permiso de ubicación
- **THEN** la fila muestra el mensaje de error inline indicando cómo habilitarla, sin bloquear el resto de la lista

### Requirement: Distancias sin selección previa
Con `userLocation` disponible, el sistema SHALL calcular y mostrar el chip de distancia en cada farmacia de la lista que tenga coordenadas, sin que el usuario haya seleccionado ninguna.

#### Scenario: Chips de distancia en toda la lista
- **WHEN** el usuario concede ubicación desde la fila «Usar mi ubicación»
- **THEN** cada farmacia con coordenadas muestra su chip de distancia «~X m/km»

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

### Requirement: Actualización de distancias en movimiento
Durante un recorrido activo, el sistema SHALL recalcular las distancias de todas las farmacias con coordenadas cada vez que la posición del usuario se aleja más de 25 m del último origen de cálculo, actualizando los chips «~X m/km» visibles.

#### Scenario: Chips actualizados durante el desplazamiento
- **WHEN** el usuario se desplaza más de 25 m con un recorrido activo
- **THEN** los chips de distancia de todas las farmacias reflejan la nueva posición

#### Scenario: Desplazamiento menor al umbral
- **WHEN** las actualizaciones de GPS se mantienen dentro de los 25 m del último origen
- **THEN** los chips de distancia no se recalculan

