## Plan: Venta de Boletos (Tickets) y Concessions (Frontend)

TL;DR - Priorizar la implementación del flujo de venta de boletos (selección y bloqueo de asientos, checkout y pago). Mantener soporte de confitería (`concessions`) como complemento en el carrito y durante el checkout.

Steps (resumen)

1. Iniciar cotización: POST `/orders/quote` (sesión requerida).
2. Conectar Socket.IO y unirse a la función: emit `join_showtime` con `{ showtimeId }`.
3. Bloquear asientos: emitir `lock_seat` por cada asiento; manejar `seat_lock_success` / `seat_lock_error` / `seat_locked_by_other`.
4. Consultar/mostrar mapa de asientos y estado en tiempo real (`showtime_{id}`).
5. Consultar catálogo de confitería si se requiere: GET `/concessions/products`, GET `/concessions/combos`.
6. Armar carrito en frontend (PRIMERO tickets, luego productos/combos opcionales).
7. Checkout: POST `/orders/checkout` con `{ tickets, concessions }` → crea orden y pone sesión en `PENDING_PAYMENT`.
8. Obtener detalles de sesión/orden: GET `/orders/session/details` para montar UI de pago y mostrar `order.id` / totales.
9. Registrar pago: POST `/orders/payments` con `{ payment_method, amount, currency, reference_number? }`.
10. Escuchar en la room `usr_{userId}` los eventos `payment_success`, `billing_required` o `quote_expired`.
11. Al confirmarse pago: mostrar `qrCode`, actualizar UI y esperar `seats_sold_final` en `showtime_{id}` para actualizar el mapa de asientos.
12. Manejar expiraciones y errores (redirigir a crear nueva cotización si la sesión expira; limpiar locks si hay desconexión).

Orden de llamadas y sockets (secuencia recomendada)

- POST `/orders/quote`
- Socket.IO connect → emit `join_showtime` → esperar `join_success`
- Emit `lock_seat` / `unlock_seat` según selección
- GET `/concessions/products`, GET `/concessions/combos` (opcional)
- POST `/orders/checkout`
- GET `/orders/session/details` -> esperar `status === 'pending_payment'` y `order.id`
- POST `/orders/payments`
- Escuchar `usr_{userId}` para `payment_success` / `billing_required` / `quote_expired`
- Escuchar `showtime_{id}` para `seat_locked_by_other`, `seat_unlocked(s)` y `seats_sold_final`

WebSocket - emitir (frontend)

- `join_showtime`: { showtimeId }
- `leave_showtime`: { showtimeId }
- `lock_seat`: { seatId, booking? }
- `unlock_seat`: { seatId }

WebSocket - escuchar (frontend)

- `join_success`, `join_error`
- `seat_lock_success` (emitido al socket que bloqueó)
- `seat_lock_error`
- `seat_locked_by_other` (broadcast en la sala)
- `seat_unlocked` (evento singular) y `seats_unlocked` (evento con `seatIds`)
- `seats_sold_final`
- `payment_success` (room `usr_{userId}`)
- `billing_required` (room `usr_{userId}`)
- `quote_expired` (room `usr_{userId}`)

Endpoints REST claves

- POST `/orders/quote`
- GET `/orders/session`
- GET `/orders/session/details`
- DELETE `/orders/session`
- POST `/orders/checkout`
- POST `/orders/payments`
- POST `/orders/billing` (empleados)
- GET `/concessions/products`, `/concessions/combos`

Salas / rooms

- `showtime_{showtimeId}` — eventos de asientos en tiempo real
- `usr_{userId}` — notificaciones de pago/facturación y expiraciones

Relevant files

- [src/modules/orders/\_.route.ts](src/modules/orders/_.route.ts#L1-L36)
- [src/modules/orders/\_.service.ts](src/modules/orders/_.service.ts#L1-L120)
- [src/modules/orders/\_.service.ts](src/modules/orders/_.service.ts#L520-L820)
- [src/shared/providers/realtime.provider.ts](src/shared/providers/realtime.provider.ts#L2-L80)
- [src/shared/services/booking-socket.service.ts](src/shared/services/booking-socket.service.ts#L1-L140)
- [src/modules/concessions/\_.route.ts](src/modules/concessions/_.route.ts#L1-L76)
- [src/modules/concessions/\_.service.ts](src/modules/concessions/_.service.ts#L1-L120)

Verification

1. Manual: probar flujo en Postman/UI y validar eventos WS (usar `wsBaseUrl` de tests).
2. Integración: usar tests Bruno existentes (`src/tests/bruno/Orders/Realtime Seating.bru`).
3. Verificar que POST `/orders/checkout` → GET `/orders/session/details` devuelve `status === 'pending_payment'` y `order.id`.
4. Tras POST `/orders/payments` con monto suficiente, recibir `payment_success` en `usr_{userId}` y `seats_sold_final` en `showtime_{id}`.

Ejemplos de respuestas (backend)

- POST `/orders/quote` - Success:
  {
  "success": true,
  "message": "Cotización creada",
  "data": {
  "cinema": 3,
  "expires_in": 600,
  "created_at": "2026-06-11T12:00:00.000Z",
  "expires_at": "2026-06-11T12:10:00.000Z"
  }
  }

- POST `/orders/quote` - Error (validación):
  {
  "success": false,
  "message": "La sucursal es requerida",
  "errors": []
  }

- GET `/orders/session` - Session activa:
  {
  "success": true,
  "message": "Sesión encontrada",
  "data": {
  "cinema": 3,
  "status": "pending_order",
  "customerId": 42,
  "created_at": "2026-06-11T12:00:00.000Z",
  "expires_at": "2026-06-11T12:10:00.000Z",
  "expires_in": 450
  }
  }

- GET `/orders/session` - Sin sesión:
  {
  "success": true,
  "message": "No hay sesión activa",
  "data": null
  }

- GET `/orders/session/details` - Con orden pendiente:
  {
  "success": true,
  "message": "Detalles de sesión",
  "data": {
  "session": { "cinema":3, "status":"pending_payment", "expires_in":540 },
  "order": {
  "id": 123,
  "subtotal_base_currency": 10.00,
  "tax_amount_base_currency": 1.80,
  "total_amount_base_currency": 11.80,
  "order_status": 1,
  "\_OrderLines": [],
  "\_Tickets": []
  }
  }
  }

- POST `/orders/checkout` - Éxito:
  {
  "success": true,
  "message": "Orden creada",
  "data": {
  "order_id": 123,
  "subtotal_base_currency": 10.00,
  "total_amount_base_currency": 11.80
  }
  }

- POST `/orders/checkout` - Error (sesión expirada):
  {
  "success": false,
  "message": "La sesión de compra ha expirado o no existe."
  }

- POST `/orders/payments` - Pago completo (cliente):
  {
  "success": true,
  "message": "Pago registrado y orden completada",
  "data": {
  "orderId": 123,
  "order_status": 4,
  "qrCode": "https://.../qrcode/XYZ"
  }
  }

- POST `/orders/payments` - Pago parcial:
  {
  "success": true,
  "message": "Pago parcial registrado exitosamente",
  "data": { "remaining_balance": 5.20 }
  }

- Socket.IO events (examples):
    - `join_success`: { "showtimeId": 12, "message": "Joined room showtime_12" }
    - `seat_lock_success`: { "seatId": 5 }
    - `seat_lock_error`: { "seatId": 5, "message": "Asiento ocupado" }
    - `seats_unlocked`: { "seatIds": [5,6] }
    - `seats_sold_final`: { "seatIds": [5,6,7] }
    - `payment_success`: { "orderId": 123, "qrCode": "https://.../qrcode/XYZ" }

Decisions / Suposiciones

- Carrito se mantiene en frontend; server valida y recalcula precios en checkout.
- Sesión de compra identificada por `userId` en Redis; frontend debe manejar expiración TTL.
- Socket.IO auth via header `Authorization: Bearer <token>`.

Further Considerations

1. UX: reservar visualmente el carrito y mostrar cuenta regresiva de la cotización (TTL ~10 minutos).
2. Soporte de métodos de pago: implementar lógica para pagos parciales y `remaining_balance` en UI.
3. Manejo offline: si WS cae, el frontend debe revalidar estado con `GET /orders/session` y `GET /orders/session/details`.
