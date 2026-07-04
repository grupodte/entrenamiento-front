export function useGTM() {
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData,
      });
      console.log('GTM Event tracked:', eventName, eventData);
    }
  };

  const trackPageView = (pageName: string, pageData?: Record<string, any>) => {
    trackEvent('page_view', {
      page_title: pageName,
      ...pageData,
    });
  };

  const trackButtonClick = (buttonName: string, location?: string) => {
    trackEvent('button_click', {
      button_name: buttonName,
      button_location: location,
    });
  };

  const trackFormSubmit = (formName: string, formData?: Record<string, any>) => {
    trackEvent('form_submit', {
      form_name: formName,
      ...formData,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackFormSubmit,
  };
}

declare global {
  interface Window {
    dataLayer?: any[];
  }
}
