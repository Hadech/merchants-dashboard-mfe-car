/**
 * Builds a WhatsApp share URL for the given link.
 */
export function getWhatsAppShareUrl(url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(url)}`
}

/**
 * Builds a Facebook share URL for the given link.
 */
export function getFacebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

/**
 * Builds an X (Twitter) share URL for the given link.
 */
export function getXShareUrl(url: string): string {
  return `https://twitter.com/home?status=${encodeURIComponent(url)}`
}
