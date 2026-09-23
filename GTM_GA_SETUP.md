# Tracking: estado real y configuración pendiente

Contenedor GTM: `GTM-N9HWTK83` · GA4: `G-8BJ5P49579` · Meta Pixel: `1137680301746095`

## Estado del contenedor (verificado sobre el gtm.js publicado)

| Tag | Dispara con | Estado |
|---|---|---|
| GA4 Event (`{{Event}}` → G-8BJ5P49579) | Custom Event regex `.*` | ⚠️ sin parámetros mapeados |
| Meta Pixel — PageView | `gtm.js` | ✅ |
| Meta Pixel — Lead | `meta_lead` | ⚠️ sin `value`/`currency` |
| Meta Pixel — Schedule | `meta_schedule` | ⚠️ sin `value`/`currency` |

Los eventos **sí** llegan a GA4: el tag GA4 dispara con todos. Lo que no llega es
ningún parámetro, porque el tag no tiene tabla de parámetros configurada.

## Lo que ya está resuelto en el código

- `page_view` se emite desde el router para **todas** las rutas
  (`src/lib/pageViewTracking.ts`), con `page_path` y `page_location` explícitos.
  Antes cada página lo hacía por su cuenta y varias rutas no reportaban nada.
- Las rutas desconocidas también emiten `page_view` (`page_name: unknown`), para
  que los links rotos de campañas aparezcan en GA4.
- Los UTMs se capturan en la primera carga de cualquier ruta. Antes solo se
  capturaban en `/pre-call`, así que una campaña apuntando a
  `/landing-page?utm_source=...` perdía la atribución al navegar.
- Las funciones de tracking tienen identidad estable, así que los `useEffect` que
  dependen de ellas ya no se re-ejecutan en cada render duplicando eventos.
- `/landing`, `/landing-pge` y `/landing0page` redirigen a `/landing-page`
  (`vercel.json`).

## Pendiente en la UI de GTM

### 1. Excluir los eventos internos de GTM
El trigger del tag GA4 usa regex `.*`, que también matchea `gtm.js`, `gtm.dom` y
`gtm.load`. Cambiar el regex a:

```
^(?!gtm\.).*$
```

### 2. Mapear los parámetros en el tag GA4
Crear variables de dataLayer y agregarlas en **Parámetros del evento** del tag GA4:

`page_name`, `page_path`, `page_location`, `page_type`, `session_id`,
`milestone_name`, `cta_location`, `cta_text`, `step`, `progress_percent`,
`from_page`, `to_page`, `value`, `currency`, `event_id`

Sin esto, GA4 sigue recibiendo solo nombres de evento y el embudo no se puede segmentar.

### 3. `value` / `currency` al Pixel de Meta
Mapear `DLV - value` y `DLV - currency` a los parámetros `value` y `currency` de
los tags Lead y Schedule. Los valores ya viajan en el dataLayer
(`src/lib/metaConversionValues.ts`).

## Pendiente en la UI de GA4

### 1. Marcar eventos clave
Admin → Eventos → marcar como clave: `meta_lead`, `meta_schedule`,
`booking_completed`. Hoy la columna "Eventos clave" está en 0,00 porque no hay
ninguno marcado.

### 2. Revisar el flujo de datos
En el informe aparecen `//checkout/` y `/contacto`, rutas que no existen en este
repo. Verificar en Admin → Flujos de datos si `G-8BJ5P49579` está recibiendo
tráfico de otro sitio.

## Inventario de eventos

| Evento | Parámetros | Dónde |
|---|---|---|
| `page_view` | `page_name`, `page_title`, `page_path`, `page_location`, `page_referrer`, `session_id`, `page_type`, `mode`, utm_* | router (todas las rutas) |
| `milestone` | `milestone_name`, `session_id`, `timestamp` | LandingPage (`video_unlocked`) |
| `cta_click` | `cta_location`, `cta_text`, `session_id` | LandingPage |
| `button_click` | `button_name`, `button_location` | Home |
| `page_navigation` | `from_page`, `to_page`, `session_id`, `timestamp` | PreCall, Agenda |
| `precall_choice` | `field`, `value`, `step`, `session_id` | PreCall |
| `precall_step_reached` | `step`, `total`, `progress_percent`, `session_id` | PreCall |
| `budget_rejection` | `reason`, `step`, `session_id` | PreCall |
| `precall_submitted` | `dias_entrenamiento`, `principal_need`, `session_id` | PreCall |
| `meta_lead` | `event_id`, `value`, `currency` | PreCall (conversión) |
| `agenda_booking_success` | `session_id`, `event_id`, `slot` | Agenda |
| `meta_schedule` | `event_id`, `value`, `currency` | Agenda (conversión, no en `/alumno-agenda`) |
| `booking_completed` | `conversion_type` | AgendaGracias |

## Verificación

1. `npm run dev`, abrir DevTools → Console.
2. `window.dataLayer.filter(e => e.event === 'page_view')` — debe haber uno por
   ruta visitada, con `page_path` correcto.
3. Navegar `/` → `/landing-page` → `/pre-call` → `/agenda` y confirmar que hay
   exactamente 4 `page_view`, sin repetidos.
4. GTM Preview mode para confirmar que el tag GA4 dispara y con qué parámetros.
5. GA4 → Tiempo real para ver los eventos llegando.
