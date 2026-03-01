# Arquitectura - Farmaturno

## Decisiones tecnológicas

**Framework**: Astro
**Razón**: App de alcance acotado, con un único fetch diario cacheado y una zona de interactividad bien delimitada. La arquitectura de islands de Astro encaja de forma natural con este patrón.

---

## Estrategia de datos

### El endpoint externo

- Existe un único endpoint (no controlado por el equipo) que devuelve un array con todas las farmacias de turno.
- El rango de datos que devuelve abarca desde aproximadamente 3 años atrás hasta 2 días adelante de la fecha en que se realiza la consulta.
- No es posible pedir un subconjunto de fechas: siempre devuelve el rango completo.

### Fetch diario con caché

El llamado al endpoint se realiza **una única vez por día**, desde el servidor de Astro. El resultado se cachea durante 24 horas (o hasta el siguiente día).

**Por qué es suficiente con un llamado diario:**
Los datos de turno no cambian dentro de un mismo día. Una vez obtenidos, son válidos para cualquier consulta que el usuario realice durante esa jornada. No tiene sentido repetir el fetch para cada visita o cada cambio de fecha en la UI.

**Consecuencia importante:** el servidor nunca llama al endpoint externo más de una vez por día, independientemente de cuántos usuarios accedan a la app.

### Filtrado client-side

Una vez que el servidor entrega los datos al cliente (ya filtrados del cache), **todo el filtrado por fecha ocurre en el navegador**, sin ningún llamado adicional al servidor ni al endpoint externo.

Cuando el usuario selecciona una fecha diferente en la interfaz:
1. No se realiza ningún fetch.
2. El cliente filtra el array ya disponible en memoria por la fecha seleccionada.
3. La UI se actualiza de forma instantánea.

Esto es posible porque el payload del endpoint ya contiene el rango de fechas completo que el usuario puede necesitar consultar (hasta 2 días adelante).

---

## Interactividad (Islands)

La mayor parte de la página es estática. La interactividad queda delimitada a un único island que concentra:

- Selector de fecha con filtrado local
- Visualización de resultados (nombre, dirección, teléfono)
- Mapa con pins de ubicación (Google Maps API)
- Integración con ubicación actual del usuario (Geolocation API)

Este island recibe los datos completos como prop desde Astro y opera de forma autónoma a partir de ahí.

---

## Flujo resumido

```
Usuario accede a la app
        │
        ▼
Astro Server: ¿hay datos en caché del día?
   ├── Sí → entrega datos cacheados al client island
   └── No → fetch al endpoint externo → cachea → entrega al client island
                                │
                                ▼
                    Client Island (React / framework a definir)
                        - Filtra por fecha seleccionada (local)
                        - Renderiza farmacias con teléfono
                        - Muestra mapa con pins (Google Maps API)
                        - Usa Geolocation API para ubicación del usuario
```
