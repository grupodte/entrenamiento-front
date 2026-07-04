# Google Tag Manager - Configuración DemicheriFitness

## ID del Contenedor GTM
**GTM-N9HWTK83**

---

## Eventos Capturados

### 1. **Page Views (Vistas de Página)**
- `page_view` - Se dispara en Home y PreCall
  - **Datos:**
    - `page_title`: Nombre de la página (ej: "home", "pre_call", "agenda_confirmada")
    - `page_url`: URL actual

### 2. **Clics en Botones (Landing Page - Home)**

#### Flujos de CTA:
- **`start_pre_call`** - Click en "Quiero empezar"
  - `button_location`: "hero_cta" | "closing_cta"
  - Ocurre: Secciones de inicio y cierre de la landing page

- **`view_plans`** - Click en "Ver los planes"
  - `button_location`: "hero_section"
  - Ocurre: Cuando el usuario hace scroll a la sección de planes

---

### 3. **Pre-Call Funnel (Embudo de Evaluación)**

#### Inicio:
- **`page_view`** - Usuario entra a PreCall
  - `page_title`: "pre_call"
  - `initial_step`: 0

#### Progresión de pasos:
- **`precall_step_reached`** - Se alcanza un nuevo paso (1-8)
  - `step`: Número del paso actual (1-8)
  - `total`: 8 (total de pasos)
  - `progress_percent`: Porcentaje de progresión (12.5%, 25%, etc.)

#### Decisiones en PreCall:
- **`precall_choice`** - Usuario selecciona una opción
  - `field`: Campo de la pregunta (ej: "entrenaDias", "compromiso", "tieneEquipo", etc.)
  - `value`: Valor seleccionado
  - `step`: Número del paso donde ocurrió

#### Rechazo por presupuesto:
- **`budget_rejection`** - Usuario selecciona "No es el momento"
  - `reason`: "insufficient_budget"
  - `step`: 5 (paso del presupuesto)
  - **Flujo:** Usuario navega a `/no-es-el-momento`

#### Envío del formulario:
- **`precall_submitted`** - Usuario envía el formulario y confirma cita
  - `dias_entrenamiento`: Valor seleccionado (2x, 3x, +3x)
  - `principal_need`: Necesidad principal (rutina, dieta, rutina-dieta)
  - `lead_id`: ID único del lead en la BD (si se guardó)
  - **Flujo:** Usuario navega a `/agenda` → página de gracias

---

### 4. **Conversión Final (Confirmación de Cita)**

- **`page_view`** - Usuario llega a página de gracias
  - `page_title`: "agenda_confirmada"

- **`booking_completed`** - Evento de conversión
  - `conversion_type`: "agenda_confirmada"
  - **Flujo:** Página de éxito después de agendar

---

## Embudo de Conversión (Funnel)

```
Home (Landing Page)
  ↓ [start_pre_call]
Pre-Call Step 0 (Bienvenida)
  ↓
Pre-Call Step 1 (Días de entrenamiento)
  ↓
Pre-Call Step 2-4 (Evaluación)
  ↓
Pre-Call Step 5 (Presupuesto: $200 USD)
  ├─ [budget_rejection] → No es el momento ❌
  └─ Continúa → Step 6-8 (Datos de contacto)
    ↓ [precall_submitted]
Página de Gracias / Confirmación
  ↓ [booking_completed] ✅ CONVERSIÓN

```

---

## Pasos de Configuración en GTM

### 1. **Crear Variables Personalizadas**

#### Variable de Capa de Datos (Data Layer):
Para cada evento, crear variables que capturen los parámetros:

```
Nombre: DL - Event Name
Tipo: Variable de capa de datos
Clave: event
```

```
Nombre: DL - Step
Tipo: Variable de capa de datos
Clave: step
```

```
Nombre: DL - Button Name
Tipo: Variable de capa de datos
Clave: button_name
```

```
Nombre: DL - Button Location
Tipo: Variable de capa de datos
Clave: button_location
```

```
Nombre: DL - Conversion Type
Tipo: Variable de capa de datos
Clave: conversion_type
```

### 2. **Crear Disparadores (Triggers)**

#### Trigger: Page View (todos los eventos de página)
```
Nombre: Trigger - Page View
Tipo: Vista de página
Configuración: Todas las vistas de página
```

#### Trigger: Button Click
```
Nombre: Trigger - Button Click
Tipo: Evento personalizado
Nombre del evento: button_click
```

#### Trigger: Pre-Call Step Reached
```
Nombre: Trigger - PreCall Step Reached
Tipo: Evento personalizado
Nombre del evento: precall_step_reached
```

#### Trigger: Form Submission
```
Nombre: Trigger - Form Submission
Tipo: Evento personalizado
Nombre del evento: form_submit
```

#### Trigger: Conversión (Budget Rejection)
```
Nombre: Trigger - Budget Rejection
Tipo: Evento personalizado
Nombre del evento: budget_rejection
```

#### Trigger: Booking Completed
```
Nombre: Trigger - Booking Completed
Tipo: Evento personalizado
Nombre del evento: booking_completed
```

### 3. **Crear Etiquetas (Tags) en Google Analytics 4**

Para medir eventos en Google Analytics, crea etiquetas con:

```
Nombre: GA4 - Page View
Tipo: Google Analytics: Evento de GA4
ID de medición: [Tu ID de GA4]
Nombre del evento: page_view
Disparador: Trigger - Page View
```

```
Nombre: GA4 - Button Click
Tipo: Google Analytics: Evento de GA4
ID de medición: [Tu ID de GA4]
Nombre del evento: button_click
Parámetros:
  - button_name: {{DL - Button Name}}
  - button_location: {{DL - Button Location}}
Disparador: Trigger - Button Click
```

```
Nombre: GA4 - PreCall Step
Tipo: Google Analytics: Evento de GA4
ID de medición: [Tu ID de GA4]
Nombre del evento: precall_step_reached
Parámetros:
  - step: {{DL - Step}}
  - progress_percent: {{DL - Progress Percent}}
Disparador: Trigger - PreCall Step Reached
```

```
Nombre: GA4 - Budget Rejection
Tipo: Google Analytics: Evento de GA4
ID de medición: [Tu ID de GA4]
Nombre del evento: budget_rejection
Parámetros:
  - reason: insufficient_budget
  - step: 5
Disparador: Trigger - Budget Rejection
```

```
Nombre: GA4 - Booking Completed
Tipo: Google Analytics: Evento de GA4
ID de medición: [Tu ID de GA4]
Nombre del evento: booking_completed
Parámetros:
  - conversion_type: agenda_confirmada
Disparador: Trigger - Booking Completed
```

---

## Cómo Ver los Datos

### En Google Tag Manager:
1. Ve a **Vista previa y depuración** (Preview & Debug)
2. Visita tu sitio en otra pestaña
3. Verás los eventos disparados en tiempo real en GTM

### En Google Analytics 4:
1. Ve a **Reportes** → **Participación** → **Eventos**
2. Busca tus eventos personalizados
3. En **Exploración** puedes crear embudos (funnels) para ver:
   - Flujo: home → pre-call → presupuesto → gracias
   - Tasas de rechazo en cada paso
   - Usuarios que abandonan en presupuesto

### Dashboard Recomendado:
Crea un dashboard con:
- **Conversión total** (booking_completed)
- **Tasa de rechazo por presupuesto** (budget_rejection / total pre-call)
- **Embudo de steps** (1 → 2 → 3 → ... → 8)
- **Tiempo promedio en PreCall**
- **Clics en CTA por ubicación** (hero_cta vs closing_cta)

---

## Notas Importantes

- ✅ Los eventos se disparan automáticamente (sin necesidad de código adicional)
- ✅ Todos los eventos incluyen timestamp automático
- ✅ Los eventos se agrupan por sesión (user_id implícito)
- ⚠️ Los primeros datos tardan ~24h en procesarse en GA4
- ⚠️ Usa el **Modo de depuración** de GA4 para ver datos en tiempo real

---

## Troubleshooting

### No veo eventos en GTM
1. Abre la consola del navegador (F12)
2. Verifica que no haya errores de JavaScript
3. Revisa que `window.dataLayer` exista
4. Usa **Vista previa de GTM** (Preview mode)

### No veo eventos en GA4
1. Verifica que tu **ID de medición** sea correcto
2. Revisa que la etiqueta tenga el disparador correcto
3. Espera 24h para que GA4 procese los datos
4. Usa **Depuración en tiempo real** en GA4

---

## Implementación Actual

✅ **Ya está implementado:**
- Hook `useGTM()` en `src/lib/useGTM.ts`
- Tracking en Home.tsx (CTAs)
- Tracking en PreCall.tsx (evaluación + conversión)
- Tracking en AgendaGracias.tsx (confirmación)
- GTM script en index.html

🔧 **Próximos pasos:**
1. Configura las variables en GTM
2. Crea los disparadores
3. Crea las etiquetas en GA4
4. Prueba en modo depuración
5. Publica en producción
