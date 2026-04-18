/**
 * Takes a user name and returns the initials (first letter of each word, max 2 chars, uppercase).
 * Example: "Juan Perez" → "JP", "Maria" → "M"
 */
export function takeInitialUserName(userNamePrincipal: string): string {
  const words = String(userNamePrincipal || '').trim().split(' ')
  const letterOne = words[0] ? words[0][0].toUpperCase() : ''
  const letterTwo = words[1] ? words[1][0].toUpperCase() : ''
  return letterOne + letterTwo
}
