# today-indicator Delta Spec

## ADDED Requirements

### Requirement: Etiqueta «Hoy» solo sobre la fecha actual
El sistema SHALL mostrar la etiqueta «Hoy» junto a la fecha del selector únicamente cuando la fecha seleccionada es el día actual en la zona horaria local del dispositivo. La etiqueta SHALL ser no interactiva.

#### Scenario: Fecha seleccionada es hoy
- **WHEN** la fecha seleccionada coincide con el día actual local
- **THEN** el selector muestra la etiqueta «Hoy» junto a la fecha

#### Scenario: Fecha seleccionada no es hoy
- **WHEN** el usuario navega a una fecha distinta del día actual
- **THEN** ninguna etiqueta «Hoy» acompaña a esa fecha

### Requirement: Atajo de regreso presentado como acción
Cuando la fecha seleccionada no es el día actual y el día actual está disponible, el sistema SHALL ofrecer un atajo con semántica de acción («Ir a hoy») visualmente distinguible de una etiqueta.

#### Scenario: Atajo visible en otra fecha
- **WHEN** el usuario está viendo una fecha distinta de hoy
- **THEN** el selector ofrece la acción «Ir a hoy» que al activarse selecciona el día actual

### Requirement: Derivación de fechas exclusivamente en hora local
Toda derivación de fechas de calendario (día actual, día anterior, piso del rango de fechas disponibles) SHALL calcularse con la zona horaria local del dispositivo, sin utilizar representaciones UTC.

#### Scenario: Noche argentina cruzando la medianoche UTC
- **WHEN** el reloj local marca las 21:24 del martes (ya miércoles en UTC)
- **THEN** el día actual derivado es martes y la etiqueta «Hoy» corresponde al martes
