export function whatsappShareUrl(url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(url)}`
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
}

export function xShareUrl(url: string): string {
  return `https://twitter.com/home?status=${encodeURIComponent(url)}`
}
