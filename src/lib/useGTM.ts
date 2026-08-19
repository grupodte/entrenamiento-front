export function useGTM() {
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...eventData })
    }
  }

  const trackPageView = (pageName: string, pageData?: Record<string, any>) => {
    trackEvent('page_view', { page_title: pageName, ...pageData })
  }

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

  return { trackEvent, trackPageView, trackButtonClick, trackConversion }
}

declare global {
  interface Window { dataLayer?: any[] }
}
