# Trazabilidad: Cambios en el refresco de sesión (/auth/refresh)

Fecha: 2026-06-10
Autor: Cambios aplicados por el equipo de frontend (script automatizado vía Copilot)

## Resumen
Se identificó un problema de doble petición a `/auth/refresh` al recargar la aplicación repetidamente: una llamada respondía 200 y otra 401, lo que provocaba que el backend invalidara la sesión.

## Archivos modificados
- `src/api/axios.js`
  - Centralizado el mecanismo de refresco para evitar condiciones de carrera:
    - Se introdujo `performRefresh()` que devuelve una promesa compartida para coordinar llamadas concurrentes.
    - El interceptor de respuestas fue reescrito para usar `performRefresh` y garantizar que solo exista una invocación activa a `/auth/refresh`.
  - Se eliminó la lógica temporal para derivar rutas con `/test`.
  - Se eliminaron logs de depuración antes de confirmar los cambios.

- `src/services/auth.service.js`
  - `refreshSessionRequest()` ahora utiliza `performRefresh()` para obtener la respuesta del refresh.

- `src/context/AuthContext.jsx`
  - Se añadieron validaciones y manejo del resultado del `refreshSessionRequest()` en la inicialización de sesión.
  - Se eliminaron mensajes de depuración adicionales antes de confirmar los cambios.

## Diagnóstico y corrección
Problema observado:
- Varias solicitudes protegidas disparaban su propia lógica de refresco simultáneamente; la implementación previa no garantizaba exclusión mutua y encolamiento correcto, lo que podía enviar el refresh token (RT) dos veces al backend.

Corrección aplicada:
- Reemplazo del patrón `isRefreshing` + `failedQueue` por una promesa compartida (`refreshPromise` / `performRefresh`) para que todas las solicitudes que necesiten refresco esperen la misma promesa.
- `AuthContext` y el interceptor ahora comparten la misma función de refresco (`performRefresh`) para evitar duplicados.
- Se limpiaron logs de depuración temporales y se dejó la aplicación sin mensajes ruidosos en consola.

## Pruebas realizadas
- Caso manual reproducido: F5 doble tras login — ahora solo se observa una única petición a `/auth/refresh`.
- Se verificó que al fallar el refresh con 401 se ejecuta el flujo de logout (`localStorage.removeItem('user_logged')` y `window.dispatchEvent('auth:logout')`).

## Pasos siguientes / recomendaciones
- Monitorear en staging durante unas horas para confirmar que no reaparece la duplicación.
- Considerar rehacer un pequeño test E2E que haga reloads concurrentes y valide que sólo un refresh ocurre.
- Si el backend implementa rotación de refresh tokens (RT invalidado al usarlo), mantener la promesa compartida es crítico.