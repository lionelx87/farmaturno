## 1. Lógica de cierre en el contexto

- [x] 1.1 Extraer función pura `getClosingTime(hour: number): { time: string; tomorrow: boolean }` en `PharmacyAppContext.tsx` con los umbrales 09:00 y 23:00
- [x] 1.2 Agregar `closingTime: { time: string; tomorrow: boolean } | null` al interface `PharmacyAppContextValue` (null cuando `selectedDate !== today`)
- [x] 1.3 Calcular `closingTime` en el provider usando `getClosingTime` y exponerlo en el value del contexto

## 2. UI en Sidebar

- [x] 2.1 Leer `closingTime` desde el contexto en `Sidebar.tsx`
- [x] 2.2 Renderizar el indicador de cierre ("hasta las 23:00" / "hasta las 09:00 de mañana") junto a la lista de farmacias activas
- [x] 2.3 Verificar que el indicador no se muestre al navegar a fechas pasadas o futuras
