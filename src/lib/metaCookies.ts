export function getMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {}

  const cookies = document.cookie.split('; ').reduce<Record<string, string>>((acc, pair) => {
    const [key, ...rest] = pair.split('=')
    if (key) acc[key] = rest.join('=')
    return acc
  }, {})

  return { fbp: cookies['_fbp'] || undefined, fbc: cookies['_fbc'] || undefined }
}
