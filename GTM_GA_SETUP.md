# Configuración de GTM → GA4 para el funnel de conversión

## Problema actual
Los eventos se envían a dataLayer pero GTM no está configurado para reenviarlo a GA4. Por eso Analytics muestra 0% en los pasos 2-5.

## Solución: Configurar en Google Tag Manager

### 1. Crear una etiqueta GA4 (si no existe)
- Ve a **Tags** → **New**
- Selecciona **Google Analytics: GA4 Configuration**
- Measurement ID: (tu GA4 ID)
- Enable automatic event tracking: ON
- **Save**

### 2. Crear disparadores para eventos personalizados
Crea disparadores para cada evento en GTM:

#### Disparador 1: Page View
- **Triggers** → **New**
- Nombre: `gtm.pageview`
- Tipo: **Page View**
- Todas las pages
- **Save**

#### Disparador 2: Events personalizados
- **Triggers** → **New**
- Nombre: `Custom Event`
- Tipo: **Custom Event**
- Event name: `(.*)` (captura todos)
- Regex: ✓ ON
- **Save**

### 3. Configurar GA4 para recibir eventos
- Ve a tu **GA4 Property**
- **Admin** → **Data Streams** → **web**
- Click en el Google Tag Manager ID
- Asegúrate que está correctamente conectado

### 4. Crear conversiones en GA4
En GA4, define conversiones basadas en estos eventos:

**Conversión 1: Video Unlocked**
- Event name: `milestone`
- Condición: `milestone_name` = `video_unlocked`

**Conversión 2: Pre-call Lead**
- Event name: `meta_lead`
- (Este ya se trackea en PreCall.tsx)

**Conversión 3: Schedule Booked**
- Event name: `meta_schedule`
- (Este ya se trackea en Agenda.tsx)

### 5. Ver el funnel en Analytics
Una vez configuradas las conversiones, verás el flujo en:
**Reports** → **Engagement** → **Funnels**

---

## Eventos que estamos enviando

### Landing Page
```
- page_view: landing_page, session_id
- milestone: video_unlocked, video_progress_pct, unlock_method
- cta_click: cta_location, cta_text (cuando hace click en CTA)
```

### Pre-Call
```
- page_view: pre_call, session_id
- page_navigation: from_page=landing_page, to_page=pre_call, session_id
- precall_choice: field, value, step, session_id
- precall_step_reached: step, total, progress_percent, session_id
- meta_lead: event_id, value, currency, session_id (conversión)
- precall_submitted: dias_entrenamiento, principal_need, session_id
- page_navigation: from_page=pre_call, to_page=agenda, session_id
```

### Agenda
```
- page_view: agenda, session_id, mode, page_type
- page_navigation: from_page=pre_call, to_page=agenda, session_id
- agenda_booking_success: session_id, event_id, slot
- meta_schedule: event_id, value, currency (conversión)
```

---

## Pendiente manual en GTM: value/currency al Pixel de Meta

Los eventos `meta_lead` y `meta_schedule` ahora incluyen `value` y `currency` en el
dataLayer (ver `src/lib/metaConversionValues.ts`). Si en GTM hay un tag de Meta Pixel
(fbq) disparado por estos eventos, hay que:
1. Crear/editar variables de dataLayer `DLV - value` y `DLV - currency`.
2. En el tag de Meta Pixel, mapear esas variables a los parámetros `value` y `currency`
   del evento (Lead / Schedule).

Esto es configuración de la UI de GTM, no se puede desplegar desde el repo.

## Testing

1. Abre tu página en modo privado
2. Abre **DevTools** → **Console**
3. Ejecuta: `window.dataLayer` 
4. Verifica que los eventos aparezcan en la lista
5. Ve a **Google Tag Manager Preview mode** para ver si GTM está capturando los eventos
6. Dentro de 24h, verás los eventos en GA4 **Realtime** report
