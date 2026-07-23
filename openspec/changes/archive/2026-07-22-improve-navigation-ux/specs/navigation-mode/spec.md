# navigation-mode Delta Spec

## ADDED Requirements

### Requirement: Entrada explícita al modo navegación
Con un recorrido activo, el sistema SHALL ofrecer una acción «Iniciar navegación». El modo navegación SHALL activarse únicamente por esa acción explícita; trazar un recorrido SHALL NOT activar el modo navegación por sí solo.

#### Scenario: Botón visible con recorrido activo
- **WHEN** hay un recorrido activo hacia una farmacia
- **THEN** la acción «Iniciar navegación» está visible y habilitada

#### Scenario: Trazar ruta no navega automáticamente
- **WHEN** el usuario toca «Cómo llegar» y la ruta se dibuja
- **THEN** la app permanece en vista general, sin rotación de cámara ni UI replegada

### Requirement: Cámara que sigue al usuario con rumbo y tilt
En modo navegación, la cámara del mapa SHALL seguir la posición del usuario en cada actualización de GPS, orientando el mapa según el rumbo de desplazamiento con inclinación (tilt) y zoom de navegación. Cuando la velocidad es insuficiente para derivar rumbo, el sistema SHALL conservar el último rumbo válido.

#### Scenario: Cámara sigue el desplazamiento
- **WHEN** el usuario se desplaza con modo navegación activo
- **THEN** el mapa se recentra en la posición actualizada, rotado según el rumbo de avance, con tilt y zoom de navegación

#### Scenario: Detenido en un semáforo
- **WHEN** la velocidad reportada es cercana a cero
- **THEN** la orientación del mapa conserva el último rumbo válido sin girar erráticamente

### Requirement: Gesto del usuario suspende el seguimiento
En modo navegación, un gesto de paneo o rotación manual del usuario SHALL suspender el seguimiento de cámara y mostrar una acción «Recentrar». Activarla SHALL reanudar el seguimiento.

#### Scenario: Paneo manual suspende follow
- **WHEN** el usuario arrastra el mapa durante el modo navegación
- **THEN** la cámara deja de seguir la posición y aparece la acción «Recentrar»

#### Scenario: Recentrar reanuda el seguimiento
- **WHEN** el usuario toca «Recentrar»
- **THEN** la cámara vuelve a seguir la posición con rumbo y tilt de navegación

### Requirement: UI replegada con banner de navegación
En modo navegación, el sistema SHALL ocultar el bottom sheet (mobile) y colapsar el sidebar (desktop), y SHALL mostrar un banner persistente con el nombre de la farmacia destino, la ETA y la distancia del modo de viaje activo, junto con una acción para salir del modo.

#### Scenario: Entrada al modo repliega la UI
- **WHEN** el usuario inicia la navegación
- **THEN** el drawer/sidebar se repliega y aparece el banner con destino, ETA y distancia

#### Scenario: ETA se actualiza en movimiento
- **WHEN** un re-ruteo actualiza los resultados de ruta durante la navegación
- **THEN** el banner refleja la nueva ETA y distancia sin salir del modo

### Requirement: Salida del modo navegación
El sistema SHALL salir del modo navegación cuando el usuario lo cierre desde el banner, cuando cancele el recorrido, o cuando se detecte la llegada al destino. Al salir, la cámara SHALL restaurar orientación norte y tilt cero, y la UI replegada SHALL restaurarse.

#### Scenario: Salida manual
- **WHEN** el usuario toca la acción de salir en el banner
- **THEN** el modo navegación termina, el mapa vuelve a orientación norte sin tilt y la UI se restaura, manteniendo el recorrido trazado

#### Scenario: Cancelar recorrido termina la navegación
- **WHEN** el usuario cancela el recorrido durante la navegación
- **THEN** el modo navegación termina junto con el recorrido y la UI se restaura
