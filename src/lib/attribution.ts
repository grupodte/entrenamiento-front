// Captura los parametros de campana de la URL de entrada y los conserva 30 dias
// en localStorage: el usuario navega dentro de la SPA (/pre-call -> /agenda), y
// muchas veces toca el anuncio, se va y vuelve despues (o el navegador de
// Instagram se cierra), asi que sessionStorage perdia la atribucion.
const STORAGE_KEY = 'dmf_attribution'
const TTL_MS = 30 * 24 * 60 * 60 * 1000

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
  captured_at?: string
}

function read(): Attribution {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw) as Attribution
    const age = data.captured_at ? Date.now() - Date.parse(data.captured_at) : 0
    if (age > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return {}
    }
    return data
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

  // Meta agrega fbclid a todo clic en anuncio, aunque el anuncio no tenga UTMs.
  // No se completa utm_source: un lead con fbclid y sin UTM se informa como
  // "Meta sin atribuir" y no debe mezclarse con campañas que usan
  // utm_source=facebook (V2).

  fresh.landing_page = window.location.pathname
  fresh.referrer = document.referrer || undefined
  fresh.captured_at = new Date().toISOString()

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  } catch {
    // Modo privado o storage bloqueado: seguimos sin atribucion persistida.
  }
  return fresh
}

export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {}
  return read()
}
