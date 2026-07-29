const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function toContactLink(candidate) {
  if (
    !candidate ||
    typeof candidate !== 'object' ||
    typeof candidate.label !== 'string' ||
    typeof candidate.value !== 'string' ||
    typeof candidate.href !== 'string'
  ) {
    return undefined
  }

  const label = candidate.label.trim()
  const value = candidate.value.trim()
  if (!label || !value) return undefined

  try {
    const url = new URL(candidate.href)
    if (!allowedProtocols.has(url.protocol)) return undefined

    return { label, value, href: url.href }
  } catch {
    return undefined
  }
}

export function parseConfiguredContactLinks(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return { isConfigured: false, links: [] }
  }

  try {
    const entries = JSON.parse(value)
    if (!Array.isArray(entries)) throw new Error('Contact links must be an array')

    return {
      isConfigured: true,
      links: entries.map(toContactLink).filter(Boolean),
    }
  } catch {
    return {
      isConfigured: true,
      error: 'CONTACT_LINKS_JSON must contain a valid JSON array.',
      links: [],
    }
  }
}
