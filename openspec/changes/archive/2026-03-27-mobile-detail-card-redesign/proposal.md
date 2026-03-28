## Why

El card de detalle de farmacia en mobile presenta todos sus elementos (nombre, dirección, badges, teléfono, toggle de modo de viaje y botón de navegación) en un layout compacto que resulta visualmente abrumador. Al separar claramente la zona de datos de la zona de acciones, se mejora la jerarquía visual y la usabilidad táctil.

## What Changes

- El `PharmacyDetailCard` recibe una prop `layout: 'mobile' | 'desktop'` para renderizar dos estructuras distintas
- En mobile, el teléfono pasa de ser un link inline entre badges a una fila tappable full-width con separador
- En mobile, el toggle de modo de viaje (🚶/🚗) se integra inline junto al botón "Cómo llegar" en una única fila de acción
- El wrapper del bottom sheet mobile pierde el `p-4` (el padding pasa a manejarse internamente por sección)
- Desktop no cambia

## Capabilities

### New Capabilities

- `pharmacy-detail-mobile-layout`: Layout alternativo del card de detalle para mobile, con zonas de datos y acciones claramente separadas por dividers

### Modified Capabilities

<!-- Sin cambios de requisitos en specs existentes -->

## Impact

- `src/components/Sidebar.tsx`: único archivo afectado
  - Componente `PharmacyDetailCard`: nueva prop `layout`, nuevo JSX para mobile
  - Wrapper del bottom sheet mobile: remoción del `p-4`
