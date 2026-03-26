## 1. Contexto y lógica (PharmacyAppContext.tsx)

- [x] 1.1 Modificar `getClosingTime`: el caso `hour >= 9 && hour < 23` debe devolver `{ time: '09:00', tomorrow: true }` en lugar de `{ time: '23:00', tomorrow: false }`
- [x] 1.2 Agregar `isOvernightMix: boolean` a la interfaz `PharmacyAppContextValue`
- [x] 1.3 Calcular y exponer `isOvernightMix` en el provider: `selectedDate === today && hour >= 9 && hour < 23 && pharmaciesForDay.length > 2`

## 2. Badge por farmacia (Sidebar.tsx)

- [x] 2.1 Consumir `isOvernightMix` del contexto en `SidebarContent`
- [x] 2.2 En el `.map` de farmacias, mostrar badge "hasta 23:00" cuando `isOvernightMix && index >= 2`
- [x] 2.3 Verificar que el badge no rompe el layout en mobile (bottom sheet) ni en desktop (sidebar)
