# Meta Pixel + Conversions API

## Objetivo

Trackear el funnel de captación (PreCall → Agenda) para poder optimizar una campaña de Meta Ads, con doble vía (Pixel del browser + Conversions API server-side) para no perder conversiones por ad blockers o Safari ITP.

## Contexto existente

- GTM (`GTM-N9HWTK83`) ya está instalado en [index.html](../../../index.html) y se usa vía [src/lib/useGTM.ts](../../../src/lib/useGTM.ts) desde `Home.tsx`, `PreCall.tsx` y `AgendaGracias.tsx`.
- No hay backend propio: todo pasa por la Supabase Edge Function `cal` ([supabase/functions/cal/index.ts](../../../supabase/functions/cal/index.ts)), que expone acciones (`upsert_lead`, `create_booking`, etc.) invocadas vía `supabase.functions.invoke('cal', ...)`.
- Credenciales ya configuradas como Supabase secrets: `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN` (System User token de un Business Manager, permiso `ads_management`, vencimiento "Nunca"). También `VITE_META_PIXEL_ID` en `.env`/Vercel para el lado del browser.

## Eventos y disparo

| Evento Meta | Trigger | Archivo |
|---|---|---|
| `PageView` | Tag base del Pixel en GTM, trigger "All Pages" (configuración manual en GTM, sin cambios de código) | — |
| `Lead` | `upsert_lead` exitoso | [src/pages/PreCall.tsx](../../../src/pages/PreCall.tsx) (`handleSubmit`) |
| `Schedule` | `create_booking` exitoso | [src/pages/Agenda.tsx](../../../src/pages/Agenda.tsx) (`handleSubmit`) |

No se trackean `ViewContent`, `AddToCart` ni otros eventos de e-commerce — no aplican a este funnel de servicios.

## Deduplicación Pixel ↔ CAPI

1. Antes de invocar `cal`, el frontend genera `const eventId = crypto.randomUUID()`.
2. Lo empuja al `dataLayer` vía un nuevo método `trackConversion(eventName, eventId, data)` en `useGTM.ts`, que dispara un evento custom (`meta_lead` / `meta_schedule`) con `event_id` como parámetro. El tag de Meta Pixel en GTM (configuración manual, fuera de este repo) lee ese `event_id` de una variable de dataLayer y lo usa como Event ID del pixel tag.
3. El mismo `eventId`, más `fbp`/`fbc` (cookies que el Pixel setea solo) y la URL de la página, se mandan en el body de la invocación a `cal`.
4. La Edge Function usa esos datos para pegarle a `POST https://graph.facebook.com/v19.0/{META_PIXEL_ID}/events` con el mismo `event_id`, `em`/`ph` (SHA-256 de email/teléfono ya normalizados con las funciones existentes `normalizeEmail`/`normalizePhoneWithCountry`), `client_ip_address` y `client_user_agent` tomados de los headers del request, y `event_source_url`.

Meta deduplica automáticamente dos eventos con el mismo `pixel_id` + `event_name` + `event_id` recibidos por canales distintos dentro de una ventana de 48h.

## Manejo de errores

El envío a CAPI es **best-effort**: si falla (red, token vencido, rate limit), se loguea con `console.error` y el flujo de negocio (guardar el lead / confirmar la reserva) sigue sin cambios. Nunca debe bloquear ni fallar `upsert_lead` o `create_booking` por un error de Meta.

## Cambios de código

- **`supabase/functions/cal/index.ts`**
  - Nueva función `sha256Hex(value: string)` (Web Crypto, ya disponible en Deno) para hashear `em`/`ph`.
  - Nueva función `sendMetaCapiEvent(eventName, input)` que arma el payload y hace el `fetch` a la Graph API. No lanza — atrapa y loguea sus propios errores.
  - Se invoca (sin `await` bloqueante del response al cliente, pero sí esperada dentro del handler para no perder la ejecución en un entorno serverless) desde:
    - `case "upsert_lead"`: evento `Lead`, con `em`=email normalizado, `ph`=phone normalizado.
    - `case "create_booking"`: evento `Schedule`, con los mismos datos del lead actualizado.
  - Nuevos campos de input aceptados en ambos actions: `eventId`, `fbp`, `fbc`, `eventSourceUrl` (todos opcionales; si faltan, el evento se manda igual sin esos campos de matching).

- **`src/lib/metaCookies.ts`** (nuevo)
  - `getMetaCookies()`: lee `_fbp` y `_fbc` de `document.cookie`, devuelve `{ fbp, fbc }` (o `undefined` si no existen — el Pixel puede no haber corrido todavía en el primer request).

- **`src/lib/useGTM.ts`**
  - Nuevo método `trackConversion(eventName: 'meta_lead' | 'meta_schedule', eventId: string, data?: Record<string, any>)` que hace `trackEvent(eventName, { event_id: eventId, ...data })`.

- **`src/pages/PreCall.tsx`**
  - En `handleSubmit`, antes de invocar `cal` con `action: 'upsert_lead'`: generar `eventId`, leer cookies con `getMetaCookies()`, incluir `eventId`, `fbp`, `fbc`, `eventSourceUrl: window.location.href` en el body.
  - Tras respuesta exitosa (no `error`/`leadResponse?.error`): `trackConversion('meta_lead', eventId, { value: ... })`.

- **`src/pages/Agenda.tsx`**
  - Mismo patrón en `handleSubmit`, sobre la invocación `action: 'create_booking'`, evento `meta_schedule`.
  - Requiere importar `useGTM` (no lo usa hoy) y `getMetaCookies`.

## Fuera de alcance (configuración manual, no código)

- Tag base del Pixel en GTM (trigger "All Pages" → `PageView`).
- Tags de evento en GTM para `meta_lead` → Standard Event `Lead` y `meta_schedule` → Standard Event `Schedule`, ambos con Event ID bindeado a la variable de dataLayer `event_id`.
- Verificación en Meta Events Manager → Test Events de que Pixel y CAPI llegan deduplicados.

## Testing

- Manual: completar el flujo PreCall → Agenda en dev/staging con Meta Events Manager → Test Events abierto, confirmar que aparecen `Lead` y `Schedule` una sola vez cada uno (deduplicados) con buen match quality (email/teléfono/fbp/fbc presentes).
- Revisar logs de la Edge Function (`supabase functions logs cal`) para confirmar que `sendMetaCapiEvent` no está tirando errores silenciosos.
