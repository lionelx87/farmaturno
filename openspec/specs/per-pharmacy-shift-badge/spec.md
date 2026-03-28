## Requirements

### Requirement: Mostrar badge de cierre en farmacias durante la ventana mix
El sistema SHALL mostrar un badge de horario de cierre en **todas** las farmacias activas cuando el usuario está viendo la fecha actual en la ventana 09:00–22:59 y hay más de 2 farmacias activas (`isOvernightMix === true`).

- Las farmacias overnight (index 0 y 1) SHALL mostrar el badge "hasta las 09:00 h de mañana".
- Las farmacias day-only (index >= 2) SHALL mostrar el badge "hasta las 23:00 h".

El badge SHALL presentarse con pill background amber, compacto y a tamaño `text-[11px]`. En la lista, el badge de horario usa `ms-auto` cuando convive con el badge de distancia (empujándolo a la derecha); sin distancia queda alineado a la izquierda. En el detail card, los badges de distancia y horario se muestran apilados verticalmente.

#### Scenario: Farmacia overnight muestra badge en ventana mix
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59, hay más de 2 farmacias activas, y la farmacia tiene index 0 o 1
- **THEN** la farmacia muestra el badge "hasta las 09:00 h de mañana" en su fila del listado

#### Scenario: Farmacia day-only muestra badge en ventana mix
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59, hay más de 2 farmacias activas, y la farmacia tiene index >= 2
- **THEN** la farmacia muestra el badge "hasta las 23:00 h" en su fila del listado

#### Scenario: Badge de horario y badge de distancia coexisten en lista
- **WHEN** la farmacia muestra badge de horario y el usuario tiene ubicación habilitada
- **THEN** el badge de distancia aparece a la izquierda y el badge de horario se desplaza a la derecha (`ms-auto`), sin wrap

#### Scenario: Badge de horario sin distancia en lista
- **WHEN** la farmacia muestra badge de horario y el usuario no tiene ubicación habilitada
- **THEN** el badge de horario aparece alineado a la izquierda

#### Scenario: Badge de horario visible en detail card
- **WHEN** el usuario selecciona una farmacia durante la ventana mix
- **THEN** el detail card muestra el badge de horario correspondiente (overnight o day-only) en su propia línea, independientemente de si el badge de distancia o el teléfono están presentes

#### Scenario: Teléfono siempre debajo de los badges en detail card
- **WHEN** el detail card muestra cualquier combinación de badge de distancia, badge de horario y teléfono
- **THEN** cada elemento ocupa su propia línea en orden vertical: distancia → horario → teléfono, sin flujo inline entre ellos

#### Scenario: Fuera de la ventana conflictiva no hay badge
- **WHEN** la hora actual es menor a 09:00 o mayor o igual a 23:00
- **THEN** ninguna farmacia muestra badge de horario de cierre

#### Scenario: Fecha distinta a hoy no muestra badge
- **WHEN** el usuario selecciona una fecha distinta a la fecha actual
- **THEN** ninguna farmacia muestra badge de horario de cierre

#### Scenario: Dos o menos farmacias activas no muestran badge
- **WHEN** hay 2 o menos farmacias activas para la fecha de hoy en la ventana 09:00–22:59
- **THEN** ninguna farmacia muestra badge de horario de cierre (no hay mix, el banner global es suficiente)
