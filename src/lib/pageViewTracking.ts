// Emite un page_view por cada navegacion del router.
//
// Antes cada pagina llamaba a trackPageView() por su cuenta, asi que las rutas
// que no lo hacian (/privacy, /terms, /postulacion/*, /no-es-el-momento,
// /alumno-agenda) no existian para GA4. Centralizarlo aca garantiza que toda
// ruta reporte, incluidas las que no estan en el mapa.
import { captureAttribution, getAttribution } from './attribution'
import { getSessionId } from './useSessionTracking'
import { pushDataLayerEvent } from './useGTM'

type PageMeta = {
  name: string
  title: string
  params?: Record<string, string>
}

// El titulo se declara aca y no se lee de document.title porque useSEO lo
// escribe en un efecto, que corre despues de que el router resuelve: leerlo en
// ese momento devolveria el titulo de la pagina anterior.
const PAGES: Record<string, PageMeta> = {
  '/': { name: 'home', title: 'Home' },
  '/landing-page': { name: 'landing_page', title: 'Landing Page', params: { page_type: 'gated_content' } },
  '/pre-call': { name: 'pre_call', title: 'Pre Call', params: { page_type: 'form' } },
  '/agenda': { name: 'agenda', title: 'Agenda', params: { page_type: 'booking', mode: 'cliente' } },
  '/alumno-agenda': { name: 'alumno_agenda', title: 'Agenda Alumno', params: { page_type: 'booking', mode: 'alumno' } },
  '/gracias-agenda': { name: 'agenda_confirmada', title: 'Cita confirmada', params: { page_type: 'confirmation' } },
  '/no-es-el-momento': { name: 'no_es_el_momento', title: 'No es el momento', params: { page_type: 'exit' } },
  '/postulacion': { name: 'postulacion', title: 'Postulacion', params: { page_type: 'form' } },
  '/postulacion/gracias': { name: 'postulacion_gracias', title: 'Postulacion enviada', params: { page_type: 'confirmation' } },
  '/postulacion/no-seleccionado': { name: 'postulacion_no_seleccionado', title: 'Postulacion no seleccionada', params: { page_type: 'exit' } },
  '/privacy': { name: 'privacy', title: 'Politica de privacidad', params: { page_type: 'legal' } },
  '/terms': { name: 'terms', title: 'Terminos', params: { page_type: 'legal' } }
}

function normalizePath(pathname: string): string {
  const lower = pathname.toLowerCase()
  if (lower.length > 1 && lower.endsWith('/')) return lower.slice(0, -1)
  return lower
}

// Evita el duplicado inmediato: el primer page_view se emite a mano (el evento
// onResolved inicial del router no es garantizado) y la suscripcion puede
// repetirlo. Navegar A -> B -> A si emite las dos veces.
let lastTrackedHref: string | null = null

function trackPageView() {
  if (typeof window === 'undefined') return

  const href = window.location.href
  if (href === lastTrackedHref) return
  lastTrackedHref = href

  const path = normalizePath(window.location.pathname)
  // Una ruta desconocida igual reporta: asi aparecen en GA4 los links rotos de
  // campanas (ej. /landing-pge) en vez de perderse.
  const meta = PAGES[path] ?? { name: 'unknown', title: path }

  pushDataLayerEvent('page_view', {
    page_name: meta.name,
    page_title: meta.title,
    page_path: path,
    page_location: href,
    page_referrer: document.referrer || undefined,
    session_id: getSessionId(),
    ...getAttribution(),
    ...meta.params
  })
}

type RouterLike = {
  subscribe: (event: 'onResolved', callback: () => void) => () => void
}

/**
 * Arranca el tracking de navegacion. Devuelve la funcion para desuscribirse.
 */
export function initPageViewTracking(router: RouterLike): () => void {
  // Los UTMs se guardan antes del primer page_view y desde cualquier ruta de
  // entrada. Antes solo se capturaban en /pre-call, asi que una campana que
  // apuntaba a /landing-page?utm_source=... perdia la atribucion al navegar.
  captureAttribution()
  trackPageView()

  return router.subscribe('onResolved', trackPageView)
}
