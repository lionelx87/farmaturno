## Context

`PharmacyDetailCard` es un componente React compartido entre el sidebar de desktop y el bottom sheet de mobile. Actualmente renderiza el mismo JSX en ambos contextos: un layout en dos columnas (datos a la izquierda, toggle de modo de viaje a la derecha) con el botón "Cómo llegar" debajo.

En mobile esto genera una zona de contenido muy densa: cinco elementos apilados verticalmente en la columna izquierda compitiendo visualmente con el toggle flotante a la derecha, sin separación clara entre datos informativos y acciones.

## Goals / Non-Goals

**Goals:**
- Separar visualmente la zona de datos (nombre, dirección, badges) de la zona de acciones (teléfono, navegación) mediante dividers
- Hacer del teléfono un target táctil de ancho completo
- Integrar el toggle de modo de viaje inline con el botón "Cómo llegar"
- Mantener desktop exactamente igual

**Non-Goals:**
- Cambios en la lógica de datos o contexto
- Cambios en el layout de desktop
- Modificación de otros componentes fuera de `Sidebar.tsx`

## Decisions

### Prop `layout` en lugar de clases responsive

**Decisión**: `PharmacyDetailCard` acepta `layout?: 'mobile' | 'desktop'` (default `'desktop'`).

**Alternativa considerada**: usar prefijos `md:` de Tailwind para adaptar el layout responsive dentro del mismo JSX.

**Razón**: Los cambios estructurales son significativos — el teléfono se mueve de posición, el toggle cambia de columna a inline, los dividers requieren ancho completo. Con clases responsive el JSX quedaría ilegible. Un prop con dos paths de render es más claro y mantenible.

### Padding manejado internamente en mobile

**Decisión**: El wrapper del bottom sheet mobile pierde el `p-4`. Cada sección del layout mobile maneja su propio padding internamente.

**Razón**: Los dividers deben ser full-bleed (de borde a borde). Si el padre tiene padding, los `border-t` no llegarían a los bordes del sheet. Mover el padding adentro del componente permite que los dividers sean verdaderamente full-width.

## Risks / Trade-offs

- [Duplicación de JSX] → Dos paths de render para el mismo componente. Mitigación: el componente es relativamente pequeño y la duplicación es preferible a la complejidad de un único JSX condicional con clases responsive.
- [Default `'desktop'`] → Si se agrega un nuevo punto de uso sin pasar el prop, fallback a desktop. Es el comportamiento correcto y seguro.
