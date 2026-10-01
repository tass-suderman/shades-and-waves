import { createRoot } from 'react-dom/client'
import Root from './Root'
import './index.css'
import './standalone.css'

createRoot(document.getElementById('root')!).render(<Root />)
