/**
 * Utility for handling base path in GitHub Pages deployment
 * Returns the correct path with base URL /lux-trade-learn/ prepended
 */

const BASE_PATH = '/lux-trade-learn'

export const getBasePath = () => BASE_PATH

export const getPath = (path: string) => {
  // If already has base path, return as is
  if (path.startsWith(BASE_PATH)) return path
  // If absolute path, prepend base path
  if (path.startsWith('/')) return `${BASE_PATH}${path}`
  // Otherwise return as is
  return path
}

export const getAssetPath = (asset: string) => {
  return getPath(`/assets/${asset}`)
}
