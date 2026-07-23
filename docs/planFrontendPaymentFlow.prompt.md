## Plan: Frontend registro de pagos y visualización del QR

TL;DR: El backend ahora encola el pago en /orders/payments y no devuelve el QR en la respuesta. El frontend debe manejar el registro de pago según el método, seguir el estado de la sesión u orden, y mostrar el QR solo cuando la orden esté completamente pagada y el token QR esté disponible en `order.qr_code`.

**Pasos**

1. Mapear el flujo del backend y la nueva semántica de la API.
    - `POST /orders/payments` devuelve solo un mensaje de estado.
    - El QR no se entrega en esa respuesta.
    - El QR se genera cuando el pago completa la orden y se guarda en `orders.qr_code`.
2. Consumir los endpoints de sesión y orden del backend.
    - `GET /orders/session` para estado de pago y balance pendiente.
    - `GET /orders/session/details` para la orden pendiente y pagos asociados.
    - `GET /orders/:id` para obtener la orden finalizada y `qr_code`.
3. Implementar el payload de pago según cada método.
    - CASH (`payment_method = 1`): monto + moneda.
    - POS (`payment_method = 2`): banco, monto, moneda; este método es parte del flujo POS y no aplica en la interfaz de pago por internet.
    - MOBILE_PAYMENT (`payment_method = 3`) y BANK_TRANSFER (`payment_method = 4`): banco, monto, moneda, referencia. Si se usa `bypass`, se puede enviar solo monto y moneda.
    - LOYALTY_POINTS (`payment_method = 5`): monto + moneda.
    - BLANK_TICKET (`payment_method = 6`): código/referencia del boleto en blanco.
4. Manejar pagos parciales.
    - Si `remaining_balance > 0`, mantener la orden abierta.
    - Mostrar el saldo pendiente y permitir enviar pagos adicionales.
    - Actualizar la UI con el estado `Pago parcial registrado exitosamente`.
5. Manejar el pago completo.
    - No esperar QR en la respuesta inicial de `/orders/payments`.
    - Obtener el QR solo cuando la orden verdaderamente esté pagada.
    - La orden completa se identifica cuando ya no hay saldo pendiente o cuando llega el evento real-time.
6. Detectar eventos real-time y/o refrescar orden.
    - En pago normal, backend puede emitir `payment_completed` con `{ orderId, qrCode }`.
    - En flujo de empleado, backend puede emitir `billing_required` con `{ orderId, qrCode }`.
    - En errores, backend emite `payment_failed`.
    - En el frontend de pago por internet no es necesario conectarse al socket de POS ni enviar respuestas a dispositivos POS.
    - Si no se usa socket, consultar `GET /orders/:id` tras la confirmación de pago completa.
7. Mostrar el QR correctamente.
    - El campo `qr_code` es un token JWT/texto, no una imagen.
    - El frontend debe generar la imagen QR desde ese string usando una librería QR.
    - No intentar renderizarlo como URL de imagen ni descargarlo directamente.
8. Ajustar la UI de estados del pago.
    - `Pendiente de pago` -> formulario de pago.
    - `Pago enviado` -> espera de confirmación.
    - `Pago parcial` -> mostrar saldo restante.
    - `Pago completado` -> mostrar QR.
    - `Billing required` -> mostrar mensaje de facturación pendiente si es empleado.
9. Verificar los casos críticos.
    - Pago con POS: la primera llamada sólo encola; el QR llega después del evento `payment_completed`.
    - Pago con referencia bancaria/móvil: puede requerir validación externa, por eso no debe asumirse inmediato.
    - Pago con puntos o boleto en blanco: el orden puede completarse igualmente y generar el QR.
10. Documentar el nuevo comportamiento ante el cambio de módulo.

- Explicar que antes el frontend recibía el QR directamente desde la respuesta de pago.
- Hoy debe buscar el QR en la orden finalizada o en eventos en tiempo real.

**Verificación**

1. Probar cada método de pago con `POST /orders/payments` y confirmar que la API responde con éxito sin QR.
2. Después de pago total, consultar `GET /orders/:id` y verificar que `qr_code` está presente.
3. Generar la imagen QR desde el valor de `qr_code` en frontend.
4. Probar pago parcial seguido de pago adicional; asegurar `remaining_balance` y QR final.
5. Probar POS con socket y verificar que el evento `payment_completed` entrega `qrCode`.

**Decisiones / Suposiciones**

- El backend cambió a un procesamiento asíncrono de pagos y ya no entrega QR en la respuesta de `/orders/payments`.
- El valor correcto para renderizar QR es `order.qr_code`.
- El frontend debe apoyarse en orden terminado (`GET /orders/:id`) o en eventos de tiempo real para mostrar el QR.
- El campo `qr_code` debe convertirse a imagen QR localmente en frontend.
