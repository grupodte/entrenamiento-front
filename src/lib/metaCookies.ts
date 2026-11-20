import { getAttribution } from './attribution'

export function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}

  const cookies = document.cookie.split('; ').reduce<Record<string, string>>((acc, pair) => {
    const [key, ...rest] = pair.split('=')
    if (key) acc[key] = rest.join('=')
    return acc
  }, {})

  return { fbp: cookies['_fbp'] || undefined, fbc: cookies['_fbc'] || fbcFromAttribution() }
}

// El Pixel solo crea _fbc si carga en la pagina donde llega el fbclid. Si GTM
// tarda, un adblocker lo frena o el navegador de Instagram descarta la cookie,
// Lead/Schedule salen sin fbc (Meta mostraba 50% de cobertura). Lo armamos con el
// fbclid guardado en la atribucion, en el formato de Meta: fb.1.<ms>.<fbclid>.
function fbcFromAttribution(): string | undefined {
  const { fbclid, captured_at } = getAttribution()
  if (!fbclid) return undefined
  const ms = captured_at ? Date.parse(captured_at) : NaN
  return `fb.1.${Number.isFinite(ms) ? ms : Date.now()}.${fbclid}`
}
