## ADDED Requirements

### Requirement: Ítem de lista sin controles anidados
El ítem de la lista de farmacias SHALL estructurarse como un contenedor con dos controles hermanos: el `<button>` de selección y el `<a href="tel:">` del teléfono. El sistema SHALL NOT anidar controles interactivos (hoy el `<a>` vive dentro del `<button>`, HTML inválido).

#### Scenario: Ambas acciones operables por teclado
- **WHEN** el usuario navega la lista con Tab
- **THEN** el botón de selección y el enlace de teléfono reciben foco como elementos independientes y ambos son activables

### Requirement: Estado del selector de modo expuesto a tecnologías asistivas
Los controles del selector de modo de viaje SHALL exponer su estado activo mediante `aria-pressed`.

#### Scenario: Lector de pantalla anuncia el modo activo
- **WHEN** un lector de pantalla enfoca el control del modo activo
- **THEN** lo anuncia como presionado (`aria-pressed="true"`) y al otro como no presionado

### Requirement: Mensajes de estado anunciados
Los mensajes de estado de geolocalización (denegada, no disponible, obteniendo ubicación) SHALL renderizarse en una región con `aria-live="polite"`.

#### Scenario: Permiso denegado anunciado
- **WHEN** el permiso de ubicación es denegado y aparece el mensaje de error
- **THEN** el lector de pantalla anuncia el mensaje sin que el usuario mueva el foco

### Requirement: Íconos decorativos ocultos del árbol de accesibilidad
Los SVG decorativos (acompañados de texto o dentro de controles con `aria-label`) SHALL llevar `aria-hidden="true"`.

#### Scenario: Ícono no duplica información
- **WHEN** un lector de pantalla recorre un botón con ícono y texto
- **THEN** solo se anuncia el texto del control, no el gráfico

### Requirement: Tema declarado al navegador
El documento SHALL declarar `color-scheme` y `<meta name="theme-color">` coherentes con el tema activo, actualizándolos al alternar dark/light.

#### Scenario: Dark mode refleja el tema en el navegador
- **WHEN** el usuario activa el tema oscuro
- **THEN** la UI nativa del navegador (barras, controles de formulario, scrollbars) usa colores oscuros acordes
