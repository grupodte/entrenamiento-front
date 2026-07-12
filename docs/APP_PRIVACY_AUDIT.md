# Auditoría de App Privacy — Demicheri Fitness

Fecha de revisión: 12 de julio de 2026  
Bundle ID: `com.demicheri.fit`

## Declaración recomendada en App Store Connect

Declarar como **Data Linked to You** y con finalidad **App Functionality**, según corresponda:

- **Name**, **Email Address** y **User ID**: cuenta, autenticación, permisos, progreso y soporte.
- **Health & Fitness — Fitness** y, si corresponde por los campos almacenados, **Health**: rutinas, entrenamientos, peso, medidas, dietas y progreso.
- **Photos or Videos — Photos**: foto de perfil.
- **Audio Data**: notas de voz creadas voluntariamente por personal autorizado.
- **Identifiers — Device ID**: token técnico de notificaciones push, si App Store Connect lo clasifica como identificador de dispositivo.
- **Usage Data — Product Interaction / Other Usage Data**: reproducción de videos y datos técnicos enviados a Mux.
- **Diagnostics — Crash Data, Performance Data y Other Diagnostic Data**: errores, stack, ruta, plataforma, versión, user agent y rendimiento.

Mux recibe `viewer_user_id` como identificador vinculado al usuario para entregar, proteger y asociar el progreso del video. Esto no es tracking publicitario por sí mismo.

No marcar ningún dato como **Used to Track You**. Se eliminó Google Tag Manager y los eventos de analítica de este frontend porque no son necesarios para el servicio.

## Proveedores

- Supabase: autenticación, base de datos y almacenamiento.
- Firebase Cloud Messaging: tokens y notificaciones push.
- Mux: streaming y diagnóstico de reproducción.
- Meta/WhatsApp: comunicaciones y notas de voz.
- Resend: emails transaccionales.
- Vercel Speed Insights: solo si permanece activo en producción.

Antes de enviar, confirmar en App Store Connect que la ficha coincide con la build final y revisar los períodos reales de retención de errores, audios y datos de reproducción.

> Esta matriz es una guía técnica y no sustituye la revisión de un abogado calificado.
