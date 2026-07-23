# route-snapping Specification

## Purpose
TBD - created by archiving change improve-navigation-ux. Update Purpose after archive.
## Requirements
### Requirement: Proyección del marcador de usuario sobre la ruta activa
Con un recorrido activo, el sistema SHALL proyectar cada posición GPS sobre la polilínea de la ruta activa y SHALL renderizar el marcador de usuario en el punto proyectado cuando la desviación perpendicular es menor al umbral de snap (30 m).

#### Scenario: Posición con error GPS leve
- **WHEN** el GPS reporta una posición a menos de 30 m de la polilínea durante un recorrido activo
- **THEN** el marcador de usuario se muestra sobre la ruta, en el punto proyectado más cercano

#### Scenario: Desvío real de la ruta
- **WHEN** el GPS reporta una posición a más de 30 m de la polilínea
- **THEN** el marcador de usuario se muestra en la posición cruda reportada

### Requirement: Snap limitado al recorrido activo
Sin recorrido activo, el sistema SHALL renderizar el marcador de usuario en la posición GPS cruda, sin proyección.

#### Scenario: Ubicación concedida sin recorrido
- **WHEN** el usuario concedió ubicación pero no hay recorrido activo
- **THEN** el marcador se muestra en la posición reportada por el GPS
