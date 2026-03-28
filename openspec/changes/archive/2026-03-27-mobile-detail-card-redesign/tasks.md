## 1. PharmacyDetailCard — prop y layout mobile

- [x] 1.1 Agregar prop `layout?: 'mobile' | 'desktop'` (default `'desktop'`) a `PharmacyDetailCard`
- [x] 1.2 Implementar el layout mobile: zona de datos (nombre + dirección + badges) con padding interno
- [x] 1.3 Implementar fila de teléfono full-width con divider superior (`border-t`)
- [x] 1.4 Implementar fila de navegación con toggle 🚶/🚗 inline + botón "Cómo llegar", con divider superior
- [x] 1.5 Mantener el layout desktop existente como path por defecto (sin cambios)

## 2. Bottom sheet mobile — ajuste de wrapper

- [x] 2.1 Quitar `p-4` del wrapper `div` que envuelve `PharmacyDetailCard` en el bottom sheet mobile
- [x] 2.2 Pasar `layout="mobile"` al `PharmacyDetailCard` en el bottom sheet mobile

## 3. Verificación

- [x] 3.1 Verificar en mobile que los dividers llegan de borde a borde del sheet
- [x] 3.2 Verificar que el tap en la fila de teléfono inicia llamada correctamente
- [x] 3.3 Verificar que el toggle de modo de viaje funciona inline en la fila de navegación
- [x] 3.4 Verificar que el layout desktop no tuvo cambios
