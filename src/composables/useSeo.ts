// src/composables/useSeo.ts
import { SITE_CONFIG, buildTitle, buildCanonical, type SeoMeta } from '@/config/seo'

/**
 * Gestión de SEO sin dependencias externas.
 * Actualiza <title>, <meta>, og:, twitter:, canonical y JSON-LD.
 * Deduplica tags creados con data-seo="true".
 */
export function useSeo(meta: SeoMeta = {}) {
  if (typeof document === 'undefined') return

  const title = buildTitle(meta.title)
  const description = meta.description || SITE_CONFIG.description
  const keywords = meta.keywords || SITE_CONFIG.keywords
  const image = meta.image || SITE_CONFIG.ogImage
  const imageUrl = image.startsWith('http') ? image : buildCanonical(image)
  const canonicalUrl = buildCanonical(meta.canonical || window.location.pathname)
  const ogType = meta.type || 'website'
  const robotsContent = `${meta.noindex ? 'noindex' : 'index'},${meta.nofollow ? 'nofollow' : 'follow'}`

  // title
  document.title = title
  setMeta('title', title)

  // lang
  document.documentElement.lang = SITE_CONFIG.lang

  // standard
  setMeta('description', description, 'name')
  setMeta('keywords', keywords, 'name')
  setMeta('author', SITE_CONFIG.author, 'name')
  setMeta('robots', robotsContent, 'name')
  setMeta('theme-color', SITE_CONFIG.themeColor, 'name')

  // canonical
  setLink('canonical', canonicalUrl)

  // Open Graph
  setMeta('og:title', title, 'property')
  setMeta('og:description', description, 'property')
  setMeta('og:image', imageUrl, 'property')
  setMeta('og:url', canonicalUrl, 'property')
  setMeta('og:type', ogType, 'property')
  setMeta('og:site_name', SITE_CONFIG.name, 'property')
  setMeta('og:locale', SITE_CONFIG.locale, 'property')

  // Twitter
  setMeta('twitter:card', 'summary_large_image', 'name')
  setMeta('twitter:title', title, 'name')
  setMeta('twitter:description', description, 'name')
  setMeta('twitter:image', imageUrl, 'name')
  setMeta('twitter:url', canonicalUrl, 'name')

  // JSON-LD dinámico por página (limpia previos dinámicos)
  if (meta.jsonLd) {
    injectJsonLd(meta.jsonLd)
  } else {
    removeDynamicJsonLd()
  }
}

function setMeta(key: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  // evitar duplicar si es og/twitter generado dinámicamente
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    el.setAttribute('data-seo', 'true')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function injectJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  removeDynamicJsonLd()
  const arr = Array.isArray(data) ? data : [data]
  arr.forEach((obj) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute('data-seo-jsonld', 'true')
    script.textContent = JSON.stringify(obj)
    document.head.appendChild(script)
  })
}

function removeDynamicJsonLd() {
  document.querySelectorAll('script[data-seo-jsonld="true"]').forEach((el) => el.remove())
}

/**
 * Helper para breadcrumb JSON-LD
 */
export function breadcrumbJsonLd(items: { name: string; item: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: buildCanonical(it.item),
    })),
  }
}
