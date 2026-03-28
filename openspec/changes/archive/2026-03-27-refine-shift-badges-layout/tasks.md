## 1. Contexto y lógica (PharmacyAppContext.tsx)

- [x] 1.1 Actualizar strings en `getClosingTime`: agregar sufijo "h" a todos los valores de `time` ("09:00 h")
- [x] 1.2 Modificar el cálculo de `closingTime` en el provider: retornar `null` cuando `isOvernightMix === true`

## 2. Badge de horario en lista (Sidebar.tsx)

- [x] 2.1 Reemplazar el `flex-wrap` del área de badges por un layout de dos slots fijos (`justify-between`)
- [x] 2.2 Agregar badge overnight en la ventana mix: mostrar "hasta las 09:00 h de mañana" cuando `isOvernightMix && index < 2`
- [x] 2.3 Actualizar badge day-only: texto pasa a "hasta las 23:00 h" (agrega sufijo "h")
- [x] 2.4 Agregar pill background amber al badge de horario (overnight y day-only)
- [x] 2.5 Agregar pill background verde al badge de distancia en lista (consistente con detail card)

## 3. Validación visual

- [x] 3.1 Fix alineación: badge de horario usa `ms-auto` solo cuando convive con badge de distancia; sin distancia queda alineado a la izquierda
- [x] 3.2 Agregar badge de horario en `PharmacyDetailCard`: mismo label que en lista, junto al badge de distancia existente
- [x] 3.3 Verificar layout en desktop sidebar (320px): ambos badges visibles sin wrap en el caso más largo ("hasta las 09:00 h de mañana" + distancia) [validación visual]
- [x] 3.4 Verificar layout en mobile bottom sheet y detail card [validación visual]
- [x] 3.5 Verificar los tres casos de la ventana sin mix (00:00–08:59, 23:00–23:59, hoy con ≤2 farmacias): banner visible, sin badges [validación visual]
