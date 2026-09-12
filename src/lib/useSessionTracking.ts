import { useEffect } from 'react'
import { useGTM } from './useGTM'

const SESSION_ID_KEY = 'dmf_session_id'
const SESSION_START_TIME_KEY = 'dmf_session_start'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return crypto.randomUUID()

  try {
    let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem(SESSION_ID_KEY, sessionId)
      sessionStorage.setItem(SESSION_START_TIME_KEY, Date.now().toString())
    }
    return sessionId
  } catch {
    return crypto.randomUUID()
  }
}

export function useSessionTracking() {
  const sessionId = getOrCreateSessionId()
  const { trackEvent } = useGTM()

  const trackMilestone = (milestone: string, data?: Record<string, any>) => {
    trackEvent('milestone', {
      milestone_name: milestone,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      ...data,
    })
  }

  const trackNavigation = (fromPage: string, toPage: string, data?: Record<string, any>) => {
    trackEvent('page_navigation', {
      from_page: fromPage,
      to_page: toPage,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      ...data,
    })
  }

  return { sessionId, trackMilestone, trackNavigation }
}

export function getSessionId(): string {
  return getOrCreateSessionId()
}
