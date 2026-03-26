## MODIFIED Requirements

### Requirement: Mostrar horario estimado de cierre del turno activo
El sistema SHALL calcular y mostrar el horario estimado de cierre de las farmacias activas cuando el usuario está viendo la fecha actual. El cálculo SHALL derivarse de los umbrales de turno ya definidos en `getActivePharmacies`: 09:00 y 23:00.

Las reglas de cierre son:
- Hora actual entre 00:00 y 08:59 → turno de madrugada, cierra a las **09:00 de hoy**
- Hora actual entre 09:00 y 22:59 → mix de turnos, el turno de mayor duración cierra a las **09:00 de mañana**
- Hora actual entre 23:00 y 23:59 → turno nocturno, cierra a las **09:00 de mañana**

#### Scenario: Turno diurno activo (ventana conflictiva)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 09:00 y 22:59
- **THEN** la UI muestra "Turno hasta las 09:00 de mañana" en el banner global

#### Scenario: Turno nocturno activo (antes de medianoche)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 23:00 y 23:59
- **THEN** la UI muestra "Turno hasta las 09:00 de mañana" en el banner global

#### Scenario: Turno de madrugada activo (después de medianoche)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 00:00 y 08:59
- **THEN** la UI muestra "Turno hasta las 09:00" en el banner global
