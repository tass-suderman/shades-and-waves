import { createRoot, type Root as ReactRoot } from 'react-dom/client'
import Root from './Root'
import styles from './index.css?inline'

let root: ReactRoot | undefined
let styleElement: HTMLStyleElement | undefined
export async function bootstrap() {}
export async function mount({ domElement }: { domElement: HTMLElement }) {
  styleElement = document.createElement('style')
  styleElement.textContent = styles
    .replace(/html, body, #root\s*\{[^}]*\}/, '')
    .replace('*, *::before, *::after', '#single-spa-app *, #single-spa-app *::before, #single-spa-app *::after')
  document.head.appendChild(styleElement)
  try {
    root = createRoot(domElement)
    root.render(<Root />)
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
    root = undefined
    styleElement?.remove()
    styleElement = undefined
  }
}
