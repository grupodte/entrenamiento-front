// Captura los parametros de campana de la URL de entrada y los conserva durante
// toda la sesion, porque el usuario navega dentro de la SPA (/pre-call -> /agenda)
// y la query string se pierde en el camino.
const STORAGE_KEY = 'dmf_attribution'

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'fbclid',
] as const

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  landing_page?: string
  referrer?: string
}

function read(): Attribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Attribution) : {}
  } catch {
    return {}
  }
}

/**
 * Guarda los UTMs de la URL actual si es la primera pagina de la sesion.
 * Una visita sin UTMs no pisa lo que ya estaba guardado.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {}

  const stored = read()
  const params = new URLSearchParams(window.location.search)
  const fresh: Attribution = {}

  for (const key of UTM_KEYS) {
    const value = params.get(key)
    if (value) fresh[key] = value.slice(0, 200)
  }

  if (Object.keys(fresh).length === 0) return stored

  fresh.landing_page = window.location.pathname
  fresh.referrer = document.referrer || undefined

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  } catch {
    // Modo privado o storage bloqueado: seguimos sin atribucion persistida.
  }
  return fresh
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  return read()
}
