# bottom-sheet-snap Specification

## Purpose
TBD - created by archiving change improve-ux-flow. Update Purpose after archive.
## Requirements
### Requirement: Tres posiciones de snap
El bottom sheet mobile en modo lista SHALL soportar tres posiciones: mínima (handle + selector de fecha visibles), media (~45 dvh) y completa (~85 dvh). La posición inicial SHALL ser la media, dejando mapa y lista visibles simultáneamente.

#### Scenario: Posición inicial media
- **WHEN** el usuario abre la app en mobile sin farmacia seleccionada
- **THEN** el sheet aparece a media altura con el mapa visible por encima

#### Scenario: Posición mínima conserva la fecha
- **WHEN** el sheet está en posición mínima
- **THEN** el handle y el selector de fecha permanecen visibles y operables

### Requirement: Arrastre desde el handle con snap
El sheet SHALL poder arrastrarse desde el handle (pointer events, `touch-action: none` en el handle) y, al soltar, SHALL animarse hacia la posición de snap más cercana. Con `prefers-reduced-motion`, el cambio de posición SHALL aplicarse sin animación. El arrastre SHALL iniciarse solo desde el handle para no interferir con el scroll interno de la lista.

#### Scenario: Soltar cerca de una posición
- **WHEN** el usuario arrastra el handle y suelta entre dos posiciones
- **THEN** el sheet se anima hasta la posición de snap más cercana

#### Scenario: Scroll de lista no arrastra el sheet
- **WHEN** el usuario hace scroll sobre la lista de farmacias
- **THEN** la lista scrollea internamente y el sheet mantiene su posición

#### Scenario: Movimiento reducido
- **WHEN** el usuario tiene activo `prefers-reduced-motion`
- **THEN** los cambios de posición ocurren sin animación de transición

### Requirement: Tap en el handle alterna posiciones
Un tap en el handle SHALL alternar entre las posiciones media y completa.

#### Scenario: Tap desde posición media
- **WHEN** el sheet está en posición media y el usuario toca el handle
- **THEN** el sheet pasa a posición completa

#### Scenario: Tap desde posición completa
- **WHEN** el sheet está en posición completa y el usuario toca el handle
- **THEN** el sheet vuelve a posición media

### Requirement: Modo card sin cambios
El comportamiento del sheet con farmacia seleccionada (modo card compacto con botón «Lista») SHALL permanecer sin cambios.

#### Scenario: Selección de farmacia
- **WHEN** el usuario selecciona una farmacia en mobile
- **THEN** el sheet muestra el card compacto actual, sin posiciones de snap

