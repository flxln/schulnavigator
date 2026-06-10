export function isValidHttpsUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length === 0) {
    return false
  }
  const lower = url.trim().toLowerCase()
  if (lower.startsWith('javascript:')) {
    return false
  }
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname.length > 0
  } catch {
    return false
  }
}

export function openExternalLink(url: string): Window | null {
  if (typeof window === 'undefined') {
    return null
  }
  if (!isValidHttpsUrl(url)) {
    return null
  }
  return window.open(url, '_blank', 'noopener,noreferrer')
}

export function externalLinkHostname(url: string): string | null {
  if (!isValidHttpsUrl(url)) {
    return null
  }
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}
