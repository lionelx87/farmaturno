## MODIFIED Requirements

### Requirement: Query de búsqueda incluye categoría farmacia
El sistema SHALL construir el `textQuery` para Google Places con el prefijo `"farmacia"` seguido del nombre, dirección y ciudad: `farmacia ${name} ${address} Bariloche`.

#### Scenario: Query incluye prefijo farmacia
- **WHEN** se invoca `fetchPlaceData` con un nombre y dirección de farmacia
- **THEN** el `textQuery` enviado a Places comienza con `"farmacia "` seguido del nombre y dirección
