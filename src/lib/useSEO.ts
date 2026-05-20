import { useEffect } from 'react'

interface SEOConfig {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  structuredData?: Record<string, unknown>
}

/**
 * Hook para manejar SEO dinámicamente en cada página
 * Actualiza el título, meta description, canonical, og tags, etc.
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // Actualizar título
    document.title = config.title

    // Actualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', config.description)

    // Actualizar canonical
    const canonical = config.canonical || `https://demicherifitness.com${window.location.pathname}`
    let canonicalTag = document.querySelector('link[rel="canonical"]')
    if (!canonicalTag) {
      canonicalTag = document.createElement('link')
      canonicalTag.setAttribute('rel', 'canonical')
      document.head.appendChild(canonicalTag)
    }
    canonicalTag.setAttribute('href', canonical)

    // Actualizar og:title
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', config.ogTitle || config.title)

    // Actualizar og:description
    let ogDescription = document.querySelector('meta[property="og:description"]')
    if (!ogDescription) {
      ogDescription = document.createElement('meta')
      ogDescription.setAttribute('property', 'og:description')
      document.head.appendChild(ogDescription)
    }
    ogDescription.setAttribute('content', config.ogDescription || config.description)

    // Actualizar og:image
    if (config.ogImage) {
      let ogImage = document.querySelector('meta[property="og:image"]')
      if (!ogImage) {
        ogImage = document.createElement('meta')
        ogImage.setAttribute('property', 'og:image')
        document.head.appendChild(ogImage)
      }
      ogImage.setAttribute('content', config.ogImage)
    }

    // Actualizar structured data si se proporciona
    if (config.structuredData) {
      let schemaScript = document.querySelector('script[data-schema="page-schema"]')
      if (!schemaScript) {
        schemaScript = document.createElement('script')
        schemaScript.setAttribute('type', 'application/ld+json')
        schemaScript.setAttribute('data-schema', 'page-schema')
        document.head.appendChild(schemaScript)
      }
      schemaScript.textContent = JSON.stringify(config.structuredData)
    }
  }, [config])
}

/**
 * Schema markup para página de servicios/productos
 */
export function createServiceSchema(name: string, description: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Service',
    'name': name,
    'description': description,
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'DemicheriFitness',
      'url': 'https://demicherifitness.com'
    }
  }
}

/**
 * Schema markup para página de formulario/acción
 */
export function createFormSchema(actionName: string, formUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org/',
    '@type': 'WebPage',
    'name': actionName,
    'url': formUrl,
    'potentialAction': {
      '@type': 'RegisterAction',
      'target': formUrl
    }
  }
}
