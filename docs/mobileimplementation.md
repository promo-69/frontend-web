## Plan para adaptar el flujo de compra quote → checkout → payment con WebSockets

TL;DR: Implementa en tu React web los mismos pasos del proyecto móvil: sesión de compra (quote), creación de orden (checkout), pago (payment), bloqueo de asientos en vivo con Socket.io, y recuperación/cancelación de sesión.

---

## Qué incluye este plan

1. quote — crear sesión de compra en backend
2. checkout — procesar tickets y concesiones, calcular totales reales
3. payment — registrar el pago y recibir la confirmación
4. WebSockets — bloqueo de asientos y eventos de sesión en tiempo real
5. Estado local de carrito — tickets, productos, booking, pricing, sucursal
6. Manejo de expiración de sesión y modo degradado

---

## Implementación paso a paso

### 1. Servicios REST
Reproducir en web los endpoints usados en el móvil:

- createQuote(cinemaId) → POST /orders/quote
- processCheckout(tickets, concessions) → POST /orders/checkout
- registerPayment(paymentData) → POST /orders/payments
- getSessionState() → GET /orders/session
- getSessionDetails() → GET /orders/session/details
- cancelSession() → DELETE /orders/session

Referencia: src/services/orders.service.js.

### 2. Servicio de Socket.io
Crear un singleton similar a src/services/socket.service.js:

- getSocket() abre la conexión con io(baseUrl, { auth: { token } })
- disconnectSocket() corta la conexión
- getSocketInstance() devuelve la instancia actual

En web, usa localStorage o tu mecanismo de auth para obtener el token. No conectes esto en SSR.

### 3. Hook de bloqueo de asientos
Implementar un hook como src/hooks/buy/useSeatLock.js que gestione:

- conectar a la sala de showtime
- emitir join_showtime, lock_seat, unlock_seat, leave_showtime
- escuchar:
  - join_success
  - join_error
  - seat_lock_success
  - seat_lock_error
  - seat_locked_by_other
  - seat_unlocked
  - seats_unlocked
  - seats_sold_final
  - quote_expired
- retornar:
  - connected, joined, realtimeReady
  - lockSeat(seatId) y unlockSeat(seatId)
  - leave()

Modo degradado: si no hay socket conectado, todavía permitir selección; confía en la validación final del backend en checkout.

### 4. Estado de carrito
Crear un contexto similar a src/context/CartContext.jsx con:

- cart.tickets
- cart.products
- cart.movie
- cart.showtime
- cart.cinemaId
- cart.booking
- cart.pricingMatrix

Funciones:
- toggleSeat(seatId, seatData)
- updateTickets(enrichedTickets)
- clearCart()
- clearProducts()
- updateCartDetails(movie, showtime, extra)

También calcula totales locales para la UI y usa los totales del backend tras checkout.

### 5. Pantalla de selección de asientos
Adaptar la lógica de src/screens/private/buy/SelectSeats.jsx:

- cancelar sesión previa y crear quote antes de cargar el seat-map
- si el backend responde 409, cancelar sesión y reintentar una vez
- guardar bookingId y pricingMatrix en el carrito
- activar socket solo después de que la quote esté lista
- seleccionar asiento:
  - lockSeat(seatId)
  - solo agregar al carrito si backend confirma
- deseleccionar:
  - unlockSeat(seatId)
  - remover del carrito
- manejar eventos de otros usuarios:
  - marcar ocupados
  - liberar cuando se reciba seat_unlocked
- si el usuario vuelve atrás:
  - leave()
  - cancelSession()
  - clearCart()
- si avanza al checkout:
  - preservar bloqueos
  - no llamar leave() ni cancelar la sesión

### 6. Pantalla de checkout
Basado en src/screens/private/buy/CheckoutScreen.jsx:

- validar que haya items y usuario logueado
- solo confitería:
  - crear quote aquí
- boletos:
  - verificar sesión activa con getSessionState()
  - no recrear la quote
- payloads:
  - tickets: { seatId, booking, audienceCategoryId }
  - concessions: { line_type, product, combo, quantity }
- llamar processCheckout(...)
- almacenar la respuesta de servidor:
  - subtotal_base_currency
  - total_amount_base_currency
  - exchange_rates
  - system_base_currency
- enviar a pago todos estos datos y expiresAt
- manejar error 409 como asientos no disponibles/sesión inválida

### 7. Pantalla de pago
Basado en src/screens/private/buy/PaymentScreen.jsx:

- sincronizar timer con expiresAt
- pedir tasas de CinePuntos si faltan: getSessionState() / getSessionDetails()
- validar datos según método:
  - pagos móviles y transferencia con campos requeridos
  - puntos con saldo suficiente y tasa real
- construir payload a registerPayment
- si la respuesta es parcial o falta qr_code, no limpiar carrito
- si es exitoso:
  - clearCart()
  - redirigir a pantalla de éxito

### 8. Evento payment_success en socket
Agrega escucha de payment_success si tu backend emite ese evento para:

- actualizar orden en tiempo real
- poder notificar al usuario incluso si la UI está en otra pestaña o hubo latencia

### 9. Ajustes específicos para web
- reemplazar AsyncStorage por localStorage/sessionStorage
- usar hooks useEffect para inicializar socket y limpiar conexiones
- no usar código nativo de Expo
- si usas React Router, pasar params via query string o router state
- evitar socket en SSR y mantenerlo en cliente puro

---

## Archivos clave de referencia

- src/services/orders.service.js
- src/services/socket.service.js
- src/hooks/buy/useSeatLock.js
- src/context/CartContext.jsx
- src/screens/private/buy/SelectSeats.jsx
- src/screens/private/buy/CheckoutScreen.jsx
- src/screens/private/buy/PaymentScreen.jsx

---

## Verificación recomendada

1. Seleccionar asientos → lock successful → checkout → pago successful.
2. Simular bloqueo por otro usuario y ver UI actualizada.
3. Expirar quote y verificar que obligue a reiniciar sesión de compra.
4. Confirmar comunicación Socket.io con token auth.
5. Validar error 409 durante checkout como caso de asientos inválidos.

---

## Preguntas para afinar
- ¿Tu web ya usa state global (Redux/Context) o quieres crear un contexto nuevo?
- ¿Tu backend comparte exactamente estos endpoints y eventos de Socket.io?
- ¿Quieres un diagrama rápido de los estados de quote/checkout/payment para documentarlo?