let embedded = false

export function setEmbeddedAssetMode(value: boolean) {
  embedded = value
}

// In production this shared module lives in assets/; in dev it lives in src/.
// Resolve against the app module, never the orchestrator document's location.
export function assetUrl(name: string) {
  const moduleBase = new URL(import.meta.env.DEV ? '/' : '../', import.meta.url)
  const override = embedded ? import.meta.env.VITE_ASSET_BASE_URL : undefined
  const base = override ? new URL(override.endsWith('/') ? override : `${override}/`) : moduleBase
  return new URL(name, base).href
}
