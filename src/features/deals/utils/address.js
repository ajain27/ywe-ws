export function normalizeAddress(address) {
  return address.trim().toLowerCase().replace(/\s+/g, ' ')
}
