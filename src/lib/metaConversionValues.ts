// Meta requiere `value` + `currency` en los eventos Lead/Schedule para calcular ROAS
// (alerta "Prioridad alta" en Events Manager: "Envía códigos de divisa válidos").
// Aún no tenemos tasas de conversión Lead->Schedule ni Schedule->Venta (en testing),
// así que estos son placeholders conservadores en vez de un valor esperado real
// (ticket promedio: USD 200-300 por venta cerrada). Ajustar cuando haya datos de cierre.
// Deben coincidir con los defaults en supabase/functions/cal/index.ts (META_LEAD_VALUE_USD /
// META_SCHEDULE_VALUE_USD) para que CAPI y el Pixel del browser reporten el mismo valor.
export const META_CURRENCY = 'USD'
export const META_LEAD_VALUE = 1
export const META_SCHEDULE_VALUE = 5
