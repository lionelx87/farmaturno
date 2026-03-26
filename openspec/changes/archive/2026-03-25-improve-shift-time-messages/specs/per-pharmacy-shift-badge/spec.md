## ADDED Requirements

### Requirement: Mostrar badge de cierre en farmacias day-only
El sistema SHALL mostrar un badge "hasta 23:00" en las farmacias que no continúan en el turno nocturno, cuando el usuario está viendo la fecha actual en la ventana 09:00–22:59 y hay más de 2 farmacias activas. Las farmacias day-only son aquellas con index >= 2 en la lista de farmacias activas del día.

El badge SHALL ser visualmente compacto y no interferir con el botón de teléfono ni el indicador de distancia existentes.

#### Scenario: Ventana conflictiva con farmacia day-only
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59, hay más de 2 farmacias activas, y la farmacia tiene index >= 2
- **THEN** la farmacia muestra un badge "hasta 23:00" en su fila del listado

#### Scenario: Farmacias overnight no muestran badge
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59, y la farmacia tiene index 0 o 1
- **THEN** la farmacia no muestra ningún badge de horario de cierre diferenciado

#### Scenario: Fuera de la ventana conflictiva no hay badge
- **WHEN** la hora actual es menor a 09:00 o mayor o igual a 23:00
- **THEN** ninguna farmacia muestra el badge "hasta 23:00", independientemente de su índice

#### Scenario: Fecha distinta a hoy no muestra badge
- **WHEN** el usuario selecciona una fecha distinta a la fecha actual
- **THEN** ninguna farmacia muestra el badge "hasta 23:00"

#### Scenario: Dos o menos farmacias activas no muestran badge
- **WHEN** hay 2 o menos farmacias activas para la fecha de hoy en la ventana 09:00–22:59
- **THEN** ninguna farmacia muestra el badge "hasta 23:00" (no hay ambigüedad de turno)
