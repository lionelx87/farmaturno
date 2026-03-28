## Context

El botón "Cómo llegar" vive en `PharmacyDetailCard` (Sidebar.tsx) y llama a `onGetDirections` del contexto. Una vez que el recorrido está activo (`routeOrigin !== null`), el botón no refleja ese estado ni ofrece forma de cancelarlo. El `watchPosition` sigue corriendo en background, actualizando `routeOrigin` automáticamente cuando el usuario se mueve.

## Goals / Non-Goals

**Goals:**
- Que el botón refleje el estado actual del recorrido (activo / inactivo)
- Permitir al usuario cancelar el recorrido y detener el rastreo GPS
- Mantener `userLocation` y `distances` al cancelar (son datos del entorno, no del recorrido)

**Non-Goals:**
- Limpiar el estado al deseleccionar una farmacia (preservar el recorrido activo mientras se revisa la lista es comportamiento deseable)
- Modificar la lógica de `watchPosition` más allá de detenerlo al cancelar

## Decisions

**1. Nuevo handler `onCancelDirections` en el contexto**

Se agrega `onCancelDirections` a `PharmacyAppContext` en lugar de reutilizar lógica en el componente. Razón: mantiene la lógica de estado centralizada y coherente con el patrón existente (`onGetDirections`, `onTravelModeChange`, etc.).

Al ejecutarse:
- `setRouteOrigin(null)`
- `navigator.geolocation.clearWatch(watchIdRef.current)`
- `watchIdRef.current = null`
- `setLocationStatus('idle')`

**2. Alternancia del botón basada en `routeOrigin`**

`PharmacyDetailCard` consume `routeOrigin` del contexto para decidir qué botón renderizar. Alternativa descartada: usar `showDirections` (que también requiere `selectedPharmacy !== null`), ya que el cancelar debería funcionar independientemente de si hay farmacia seleccionada — aunque en la práctica el botón solo existe dentro de la tarjeta.

**3. Estilo del botón "Cancelar": outline neutro**

Se usa borde gris con texto gris oscuro / claro en dark mode, sin fondo de color. Razón: comunica "modo activo, click para salir" sin la connotación de peligro del rojo. Consistente con el tono visual de la app.

## Risks / Trade-offs

- [Estado fantasma] Si el usuario tiene recorrido activo y deselecciona la farmacia, `routeOrigin` persiste. Al seleccionar otra farmacia, el recorrido aparece inmediatamente sin presionar "Cómo llegar". → Comportamiento intencional: permite revisar otras farmacias sin perder el recorrido activo.
- [watchPosition huérfano] Si el usuario cierra el tab sin cancelar, el watchPosition se detiene automáticamente por el browser. Sin impacto real.
