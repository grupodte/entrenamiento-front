# GTM Quick Reference - DemicheriFitness

## 🎯 Eventos Principales (TL;DR)

| Evento | Cuándo | Dónde | Datos Útiles |
|--------|--------|-------|--------------|
| `page_view` | Usuario ve una página | Home, PreCall, AgendaGracias | `page_title`, `page_url` |
| `button_click` | Click en CTA | Home | `button_name`, `button_location` |
| `precall_step_reached` | Avanza a siguiente paso | PreCall (Steps 1-8) | `step`, `progress_percent` |
| `precall_choice` | Selecciona opción | PreCall | `field`, `value`, `step` |
| `budget_rejection` | Click "No es el momento" | PreCall Step 5 | `reason: "insufficient_budget"` |
| `precall_submitted` | Envía datos contacto | PreCall Step 8 | `dias_entrenamiento`, `principal_need` |
| `booking_completed` | ✅ Cita confirmada | AgendaGracias | `conversion_type: "agenda_confirmada"` |

---

## 🚀 Flujo de Conversión Visual

```
┌─ HOME LANDING ─────────────────────────────┐
│ Click "Quiero empezar"                      │
│ Event: start_pre_call                       │
│ Location: hero_cta / closing_cta            │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─ PRE-CALL FUNNEL ──────────────────────────┐
│ Step 1: ¿Cuántos días entrenas?            │
│ Event: precall_step_reached (1/8)           │
│                                             │
│ Step 2-4: Evaluación                        │
│ Event: precall_step_reached (2-4/8)         │
│                                             │
│ Step 5: ¿Tienes $200 USD?                  │
│ Event: precall_step_reached (5/8)           │
│   ├─ SI → Continue                          │
│   │        Event: precall_choice (si)       │
│   │        → Step 6-8                       │
│   └─ NO → budget_rejection ❌               │
│            → /no-es-el-momento              │
│                                             │
│ Step 8: Datos de contacto                   │
│ Event: precall_submitted ✅                 │
│ Data: nombre, email, whatsapp, edad         │
└─────────────┬───────────────────────────────┘
              │
              ▼
┌─ GRACIAS PAGE ─────────────────────────────┐
│ ¡Cita confirmada!                           │
│ Event: booking_completed ✅                 │
│ (CONVERSIÓN FINAL)                          │
└────────────────────────────────────────────┘
```

---

## 🔍 Cómo Revisar los Eventos

### Opción 1: GTM Preview Mode (En tiempo real)
```
1. Ve a https://tagmanager.google.com
2. Abre tu contenedor GTM-N9HWTK83
3. Haz click en "Preview" (arriba a la derecha)
4. Se abrirá un popup con instrucciones
5. Visita tu sitio en otra pestaña
6. En el popup verás todos los eventos disparados 🎉
```

### Opción 2: Google Analytics 4 (Depuración en tiempo real)
```
1. Ve a Google Analytics (tu propiedad GA4)
2. Ve a: Admin → Depuración en tiempo real
3. Debe estar activado el tracking
4. Haz acciones en tu sitio
5. Verás los eventos en la columna derecha
```

### Opción 3: Consola del Navegador (Developer Tools)
```
1. Abre tu sitio
2. Presiona F12 → Tab "Console"
3. Ejecuta: console.log(window.dataLayer)
4. Verás el array de eventos que se han disparado
```

---

## 📊 Métricas Clave a Medir

### 1. **Tasa de Conversión**
```
booking_completed / start_pre_call = Tasa de conversión
Ejemplo: 10 agendas / 100 clics iniciales = 10% conversión
```

### 2. **Abandono por Presupuesto**
```
budget_rejection / precall_step_reached(step=5) = % abandono
Ejemplo: 15 rechazos / 50 usuarios en paso 5 = 30% abandono
```

### 3. **Progresión de Pasos**
```
Usuarios en Step 1: 100
Usuarios en Step 2: 85 (85% avanzó)
Usuarios en Step 3: 72 (72% avanzó)
...
Usuarios en Step 8: 50 (50% llegó a datos contacto)
booking_completed: 45 (45% convirtió)
```

### 4. **Mejor CTA**
```
start_pre_call (hero_cta): 60% de clics
start_pre_call (closing_cta): 40% de clics
→ El hero CTA convierte más
```

---

## 🛠️ Configuración Mínima (5 min)

Para empezar a medir de inmediato, solo necesitas:

### 1. En GTM, crea 1 disparador:
```
Nombre: All Events
Tipo: Evento personalizado
Nombre del evento: .*
Usar expresiones regulares: SÍ
```

### 2. En GTM, crea 1 etiqueta:
```
Nombre: GA4 - All Events
Tipo: Google Analytics: Evento de GA4
ID de medición: G-8BJ5P49579 [Tu ID actual]
Nombre del evento: {{Event Name}}
Disparador: All Events
```

### 3. En GTM:
```
Presiona "ENVIAR" (Publish)
```

✅ Listo. Ahora todos los eventos se envían a GA4.

---

## 📱 Eventos Móviles / Desktop

Los eventos se disparan igual en ambos. No hace falta configuración adicional.

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde veo los eventos en GA4?**
R: Reportes → Participación → Eventos → Busca el nombre del evento

**P: ¿Cuánto tarda en aparecer en GA4?**
R: ~5 min en tiempo real, hasta 24h en reportes completos

**P: ¿Cómo agrego datos personalizados (ej: email del usuario)?**
R: En `trackEvent()` puedes pasar más parámetros: `trackEvent('booking_completed', { email: user.email })`

**P: ¿Debo configurar cada evento por separado en GTM?**
R: No. Con la configuración mínima (All Events) todos se envían a GA4.

**P: ¿Puedo ver los datos históricos?**
R: GA4 guarda los últimos 60 días. Usa "Exploración" para análisis custom.

---

## 🎓 Casos de Uso

### Caso 1: Optimizar landing page
```
→ Mide view_plans clicks por sección
→ ¿Qué sección tiene más clics?
→ Optimiza esa sección
```

### Caso 2: Identificar cuello de botella
```
→ Mira precall_step_reached
→ ¿Dónde cae más la retención?
→ Simplifica esa pregunta
```

### Caso 3: Recuperar usuarios perdidos
```
→ Mira budget_rejection
→ Los usuarios dicen "No es el momento"
→ Crea un email de seguimiento con oferta especial
```

### Caso 4: Validar cambios
```
→ Cambias un botón de color
→ Mides start_pre_call clicks antes/después
→ ¿Aumentaron? ¿Bajaron?
```

---

## 📞 Soporte

Para dudas sobre la implementación:
- Lee [GTM_SETUP.md](./GTM_SETUP.md) para detalles técnicos
- Consulta [Google Analytics Help](https://support.google.com/analytics)
- Revisa [GTM Documentation](https://support.google.com/tagmanager)
