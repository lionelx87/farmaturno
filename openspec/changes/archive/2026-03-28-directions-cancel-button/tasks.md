## 1. Contexto: handler en PharmacyAppContext

- [x] 1.1 Exponer `onCancelDirections` en la interfaz `PharmacyAppContextValue`
- [x] 1.2 Implementar `onCancelDirections`: limpiar `routeOrigin`, detener `watchPosition` y resetear `locationStatus` a `idle`
- [x] 1.3 Incluir `onCancelDirections` en el objeto `value` del contexto

## 2. UI: alternancia del botón en Sidebar

- [x] 2.1 Consumir `routeOrigin` y `onCancelDirections` en `PharmacyDetailCard`
- [x] 2.2 Reemplazar el botón único por lógica condicional: "Cómo llegar" si `routeOrigin === null`, "Cancelar recorrido" si `routeOrigin !== null`
- [x] 2.3 Aplicar estilo outline neutro al botón "Cancelar recorrido" (mobile y desktop)
