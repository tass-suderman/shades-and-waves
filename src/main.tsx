import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'
import { applyTheme, getThemeByName } from './themes/appThemes.ts'

// Apply the stored (or default) theme before first render so there's no flash
applyTheme(getThemeByName(localStorage.getItem('shader-playground:theme') ?? 'kanagawa'))

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
