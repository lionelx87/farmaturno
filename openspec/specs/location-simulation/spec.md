# location-simulation Specification

## Purpose
TBD - created by archiving change improve-navigation-ux. Update Purpose after archive.
## Requirements
### Requirement: Proveedor de geolocalización inyectable
La aplicación SHALL consumir la geolocalización a través de un proveedor con interfaz única (`getCurrentPosition`, `watchPosition`, `clearWatch`) en lugar de acceder directamente a `navigator.geolocation`.

#### Scenario: Uso normal en producción
- **WHEN** la app corre sin modo simulación
- **THEN** el proveedor delega en `navigator.geolocation` con comportamiento idéntico al actual

### Requirement: Activación del modo simulación solo en desarrollo
El sistema SHALL activar el proveedor simulado únicamente cuando la URL incluye el parámetro `sim` y la build es de desarrollo. En builds de producción el parámetro SHALL ser ignorado.

#### Scenario: Simulación en desarrollo
- **WHEN** la app corre en desarrollo con `?sim` en la URL
- **THEN** la geolocalización proviene del proveedor simulado y un panel de control flotante es visible

#### Scenario: Parámetro en producción
- **WHEN** una build de producción recibe `?sim` en la URL
- **THEN** la app usa la geolocalización real y no muestra panel de simulación

### Requirement: Recorrido simulado sobre la ruta activa
Con simulación activa y un recorrido trazado, el proveedor simulado SHALL emitir posiciones que avanzan a lo largo de la polilínea de la ruta activa a velocidad configurable según el modo de viaje (30 km/h DRIVING, 5 km/h WALKING por defecto), con rumbo y velocidad sintéticos coherentes con el desplazamiento, a razón de un fix por segundo.

#### Scenario: Simulación de viaje en auto
- **WHEN** el usuario inicia un recorrido DRIVING con simulación activa
- **THEN** la posición simulada avanza por la ruta a la velocidad configurada emitiendo rumbo y velocidad coherentes

#### Scenario: Llegada simulada
- **WHEN** la posición simulada alcanza el final de la polilínea
- **THEN** el flujo de llegada se dispara igual que con GPS real

### Requirement: Controles de simulación
El panel de simulación SHALL permitir pausar/reanudar el avance, alternar la velocidad (×1/×4) y activar un desvío lateral para probar el snap y el re-ruteo.

#### Scenario: Pausa y reanudación
- **WHEN** el usuario pausa la simulación
- **THEN** las posiciones dejan de emitirse hasta reanudar

#### Scenario: Desvío lateral
- **WHEN** el usuario activa el desvío lateral
- **THEN** las posiciones emitidas se desplazan perpendicularmente a la ruta lo suficiente para superar el umbral de snap
