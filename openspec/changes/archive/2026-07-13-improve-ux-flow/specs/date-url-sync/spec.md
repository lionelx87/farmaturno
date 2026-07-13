## ADDED Requirements

### Requirement: Lectura de fecha desde la URL
Al inicializar, el sistema SHALL leer el parámetro `?fecha=YYYY-MM-DD` de la URL y usarlo como fecha seleccionada si pertenece a `availableDates`. Un valor ausente, inválido o fuera de rango SHALL ignorarse y aplicar el comportamiento por defecto (`mostRecentAvailable`).

#### Scenario: Deep-link con fecha válida
- **WHEN** el usuario abre la app con `?fecha=` apuntando a una fecha disponible
- **THEN** la app muestra las farmacias de esa fecha

#### Scenario: Fecha inválida en la URL
- **WHEN** el usuario abre la app con un valor de `?fecha=` inválido o sin datos
- **THEN** la app carga la fecha por defecto sin errores visibles

### Requirement: Escritura de fecha en la URL
Al cambiar la fecha seleccionada, el sistema SHALL actualizar el parámetro `?fecha=` mediante `history.replaceState`, sin recargar la página ni crear entradas de historial por cada navegación.

#### Scenario: Navegación con flechas actualiza la URL
- **WHEN** el usuario navega a otro día con las flechas
- **THEN** la URL refleja la nueva fecha y el botón «Atrás» del navegador no recorre cada fecha visitada

### Requirement: Botón «Hoy»
El sistema SHALL mostrar un botón «Hoy» junto al selector de fecha cuando `selectedDate` no es la fecha actual. Al activarlo, el sistema SHALL volver a la fecha actual con el mismo efecto que un cambio de fecha (incluida la deselección de farmacia).

#### Scenario: Botón visible en otra fecha
- **WHEN** el usuario navegó a una fecha distinta de hoy
- **THEN** el botón «Hoy» aparece junto al selector de fecha

#### Scenario: Volver a hoy
- **WHEN** el usuario toca «Hoy»
- **THEN** la app vuelve a la fecha actual y el botón desaparece
