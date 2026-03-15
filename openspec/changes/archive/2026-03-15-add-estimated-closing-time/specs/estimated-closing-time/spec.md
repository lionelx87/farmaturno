## ADDED Requirements

### Requirement: Mostrar horario estimado de cierre del turno activo
El sistema SHALL calcular y mostrar el horario estimado de cierre de las farmacias activas cuando el usuario está viendo la fecha actual. El cálculo SHALL derivarse de los umbrales de turno ya definidos en `getActivePharmacies`: 09:00 y 23:00.

Las reglas de cierre son:
- Hora actual entre 00:00 y 08:59 → turno de madrugada, cierra a las **09:00 de hoy**
- Hora actual entre 09:00 y 22:59 → turno diurno, cierra a las **23:00 de hoy**
- Hora actual entre 23:00 y 23:59 → turno nocturno, cierra a las **09:00 de mañana**

#### Scenario: Turno diurno activo
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 09:00 y 22:59
- **THEN** la UI muestra "hasta las 23:00" junto a las farmacias activas

#### Scenario: Turno nocturno activo (antes de medianoche)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 23:00 y 23:59
- **THEN** la UI muestra "hasta las 09:00 de mañana" junto a las farmacias activas

#### Scenario: Turno de madrugada activo (después de medianoche)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 00:00 y 08:59
- **THEN** la UI muestra "hasta las 09:00" junto a las farmacias activas

### Requirement: Ocultar horario en fechas pasadas o futuras
El sistema SHALL omitir el horario estimado de cierre cuando el usuario está viendo una fecha distinta a la actual.

#### Scenario: Usuario navega a una fecha pasada
- **WHEN** el usuario selecciona una fecha anterior a hoy
- **THEN** la UI no muestra ningún indicador de horario de cierre

#### Scenario: Usuario navega a una fecha futura
- **WHEN** el usuario selecciona una fecha posterior a hoy
- **THEN** la UI no muestra ningún indicador de horario de cierre
