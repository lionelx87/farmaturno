## MODIFIED Requirements

### Requirement: Mostrar badge de cierre en farmacias durante la ventana mix
El sistema SHALL mostrar un badge de horario de cierre en **todas** las farmacias activas cuando el usuario está viendo la fecha actual en la ventana 09:00–22:59 y hay más de 2 farmacias activas (`isOvernightMix === true`).

- Las farmacias overnight (index 0 y 1) SHALL mostrar el badge "hasta las 09:00 h de mañana".
- Las farmacias day-only (index >= 2) SHALL mostrar el badge "hasta las 23:00 h".

El badge SHALL ubicarse en el slot derecho (`shrink-0`) de un layout de dos slots fijos. El slot izquierdo (`flex-1`) queda reservado para el badge de distancia cuando esté disponible.

El badge SHALL presentarse con pill background amber, compacto y a tamaño `text-[11px]`.

#### Scenario: Farmacia overnight muestra badge en ventana mix
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59, hay más de 2 farmacias activas, y la farmacia tiene index 0 o 1
- **THEN** la farmacia muestra el badge "hasta las 09:00 h de mañana" alineado a la derecha en su fila

#### Scenario: Farmacia day-only muestra badge en ventana mix
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59, hay más de 2 farmacias activas, y la farmacia tiene index >= 2
- **THEN** la farmacia muestra el badge "hasta las 23:00 h" alineado a la derecha en su fila

#### Scenario: Badge de horario y badge de distancia coexisten en lista
- **WHEN** la farmacia muestra badge de horario y el usuario tiene ubicación habilitada
- **THEN** el badge de distancia aparece a la izquierda y el badge de horario se desplaza a la derecha (`ms-auto`), sin wrap

#### Scenario: Badge de horario sin distancia en lista
- **WHEN** la farmacia muestra badge de horario y el usuario no tiene ubicación habilitada
- **THEN** el badge de horario aparece alineado a la izquierda

#### Scenario: Badge de horario visible en detail card
- **WHEN** el usuario selecciona una farmacia durante la ventana mix
- **THEN** el detail card muestra el badge de horario correspondiente (overnight o day-only) apilado verticalmente junto al badge de distancia si está disponible

#### Scenario: Fuera de la ventana conflictiva no hay badge
- **WHEN** la hora actual es menor a 09:00 o mayor o igual a 23:00
- **THEN** ninguna farmacia muestra badge de horario de cierre

#### Scenario: Fecha distinta a hoy no muestra badge
- **WHEN** el usuario selecciona una fecha distinta a la fecha actual
- **THEN** ninguna farmacia muestra badge de horario de cierre

#### Scenario: Dos o menos farmacias activas no muestran badge
- **WHEN** hay 2 o menos farmacias activas para la fecha de hoy en la ventana 09:00–22:59
- **THEN** ninguna farmacia muestra badge de horario de cierre (no hay mix, el banner global es suficiente)
