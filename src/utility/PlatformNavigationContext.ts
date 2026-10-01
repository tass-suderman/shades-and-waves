import { createContext } from 'react'

export const PlatformNavigationContext = createContext<(() => void) | undefined>(undefined)
