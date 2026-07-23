# per-pharmacy-shift-badge Specification

## Purpose
TBD - created by archiving change improve-shift-time-messages. Update Purpose after archive.
## Requirements
### Requirement: Mostrar badge de cierre en farmacias durante la ventana mix
El sistema SHALL comunicar el horario de cierre durante la ventana mix (`isOvernightMix === true`) mediante encabezados de sección en la lista y mediante badge únicamente en el detail card.

En la lista, las farmacias SHALL agruparse bajo dos encabezados de sección: "Toda la noche · hasta las 09:00" (farmacias overnight) y "Solo hasta las 23:00" (farmacias day-only). Los ítems de la lista SHALL NOT mostrar badge de horario individual; el chip de distancia queda como único badge por ítem.

La condición overnight/day-only SHALL derivarse de la posición de la farmacia en el payload original del día (index 0 y 1 = overnight) como campo propio (`shift`), no del índice visual de la lista renderizada, de modo que el orden por cercanía no altere la clasificación.

En el detail card, la farmacia seleccionada SHALL mostrar el badge de horario correspondiente ("hasta las 09:00 h de mañana" u "hasta las 23:00 h") con pill background amber, compacto y a tamaño `text-[11px]`, apilado verticalmente con el badge de distancia.

#### Scenario: Encabezados de sección en ventana mix
- **WHEN** el usuario ve la fecha de hoy, la hora es entre 09:00 y 22:59 y hay más de 2 farmacias activas
- **THEN** la lista muestra el encabezado "Toda la noche · hasta las 09:00" seguido de las farmacias overnight y el encabezado "Solo hasta las 23:00" seguido de las day-only

#### Scenario: Ítems sin badge de horario individual
- **WHEN** la lista se muestra agrupada durante la ventana mix
- **THEN** ningún ítem muestra chip de horario; solo el chip de distancia si hay ubicación

#### Scenario: Clasificación estable ante orden por cercanía
- **WHEN** la lista está ordenada por cercanía durante la ventana mix
- **THEN** cada farmacia permanece en su grupo horario según el payload original, no según su posición visual

#### Scenario: Badge de horario visible en detail card
- **WHEN** el usuario selecciona una farmacia durante la ventana mix
- **THEN** el detail card muestra el badge de horario correspondiente (overnight o day-only) en su propia línea

#### Scenario: Teléfono siempre debajo de los badges en detail card
- **WHEN** el detail card muestra cualquier combinación de badge de distancia, badge de horario y teléfono
- **THEN** cada elemento ocupa su propia línea en orden vertical: distancia → horario → teléfono, sin flujo inline entre ellos

#### Scenario: Fuera de la ventana conflictiva no hay agrupación ni badge
- **WHEN** la hora actual es menor a 09:00 o mayor o igual a 23:00
- **THEN** la lista no muestra encabezados de sección y ninguna farmacia muestra badge de horario

#### Scenario: Fecha distinta a hoy no muestra agrupación ni badge
- **WHEN** el usuario selecciona una fecha distinta a la fecha actual
- **THEN** la lista no muestra encabezados de sección y ninguna farmacia muestra badge de horario

#### Scenario: Dos o menos farmacias activas no muestran agrupación
- **WHEN** hay 2 o menos farmacias activas para la fecha de hoy en la ventana 09:00–22:59
- **THEN** la lista no muestra encabezados de sección (no hay mix, el banner global es suficiente)

