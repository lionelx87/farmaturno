## MODIFIED Requirements

### Requirement: Mostrar horario estimado de cierre del turno activo
El sistema SHALL calcular y mostrar el horario estimado de cierre de las farmacias activas cuando el usuario está viendo la fecha actual. El cálculo SHALL derivarse de los umbrales de turno ya definidos en `getActivePharmacies`: 09:00 y 23:00.

El banner global SHALL omitirse cuando `isOvernightMix === true` (ventana 09:00–22:59 con más de 2 farmacias activas), ya que en ese caso cada farmacia muestra su propio badge de horario.

Las reglas de cierre son:
- Hora actual entre 00:00 y 08:59 → turno de madrugada, cierra a las **09:00 h de hoy**
- Hora actual entre 09:00 y 22:59 con `isOvernightMix === false` → turno sin mix, cierra a las **09:00 h de mañana**
- Hora actual entre 09:00 y 22:59 con `isOvernightMix === true` → sin banner global
- Hora actual entre 23:00 y 23:59 → turno nocturno, cierra a las **09:00 h de mañana**

#### Scenario: Turno diurno activo sin mix
- **WHEN** el usuario ve la fecha de hoy, la hora local es entre 09:00 y 22:59, y hay 2 o menos farmacias activas
- **THEN** la UI muestra "Turno hasta las 09:00 h de mañana" en el banner global

#### Scenario: Turno diurno activo con mix (banner suprimido)
- **WHEN** el usuario ve la fecha de hoy, la hora local es entre 09:00 y 22:59, y hay más de 2 farmacias activas (`isOvernightMix === true`)
- **THEN** la UI no muestra ningún banner global de horario de cierre

#### Scenario: Turno nocturno activo (antes de medianoche)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 23:00 y 23:59
- **THEN** la UI muestra "Turno hasta las 09:00 h de mañana" en el banner global

#### Scenario: Turno de madrugada activo (después de medianoche)
- **WHEN** el usuario ve la fecha de hoy y la hora local es entre 00:00 y 08:59
- **THEN** la UI muestra "Turno hasta las 09:00 h" en el banner global
