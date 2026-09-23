// Push a dataLayer fuera de React, para que el tracker de navegacion del router
// (pageViewTracking.ts) pueda emitir eventos sin montar un componente.
//
// El array se inicializa aca ademas de en el snippet de GTM: si el snippet esta
// bloqueado por un adblocker, los eventos igual se acumulan en memoria en vez de
// descartarse en silencio.
export function pushDataLayerEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: eventName, ...eventData })
}

// Las funciones son estables (definidas a nivel de modulo, no por render) porque
// las paginas las usan como dependencia de useEffect: si cambiaran de identidad
// en cada render, cada efecto de tracking se volveria a disparar y duplicaria
// eventos.
const trackEvent = pushDataLayerEvent

const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent('button_click', { button_name: buttonName, button_location: location })
}

const trackConversion = (
  eventName: 'meta_lead' | 'meta_schedule',
  eventId: string,
  data?: Record<string, any>
) => {
  trackEvent(eventName, { event_id: eventId, ...data })
}

// No hay trackPageView: el page_view lo emite el tracker del router para todas
// las rutas por igual. Ver src/lib/pageViewTracking.ts.
export function useGTM() {
  return { trackEvent, trackButtonClick, trackConversion }
}

declare global {
  interface Window { dataLayer?: Record<string, unknown>[] }
}
