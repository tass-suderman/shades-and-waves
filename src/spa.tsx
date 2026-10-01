import { createRoot, type Root as ReactRoot } from 'react-dom/client'
import Root from './Root'
import { PlatformNavigationContext } from './utility/PlatformNavigationContext'
import { setEmbeddedAssetMode } from './utility/assetUrl'
import styles from './index.css?inline'

let root: ReactRoot | undefined
let styleElement: HTMLStyleElement | undefined
export async function bootstrap() {}
export async function mount({ domElement, onOpenNavigation }: { domElement: HTMLElement; onOpenNavigation?: () => void }) {
  setEmbeddedAssetMode(true)
  styleElement = document.createElement('style')
  styleElement.textContent = styles
    .replace(/html, body, #root\s*\{[^}]*\}/, '')
    .replace('*, *::before, *::after', ':where(#single-spa-app *), :where(#single-spa-app *::before), :where(#single-spa-app *::after)')
  document.head.appendChild(styleElement)
  try {
    root = createRoot(domElement)
    root.render(<PlatformNavigationContext.Provider value={onOpenNavigation}><Root /></PlatformNavigationContext.Provider>)
  } catch (error) {
    styleElement.remove()
    styleElement = undefined
    throw error
  }
}
export async function unmount() {
  try {
    root?.unmount()
  } finally {
    setEmbeddedAssetMode(false)
    root = undefined
    styleElement?.remove()
    styleElement = undefined
  }
}
