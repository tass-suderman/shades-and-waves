import React from 'react'
import App from './components/App/App'
import CssBaseline from '@mui/material/CssBaseline'
import { AppStorageProvider } from './hooks/useAppStorage'
import { MediaStreamsProvider } from './hooks/useMediaStreams'
import { StrudelAnalyzerProvider } from './hooks/useStrudelAnalyzer'
import { StrudelAudioStreamProvider } from './hooks/useStrudelAudioStream'
import { SavedContentProvider } from './hooks/useSavedContent'

export default function Root() {
  return (
    <React.StrictMode>
      <StrudelAnalyzerProvider>
        <StrudelAudioStreamProvider>
          <MediaStreamsProvider>
            <SavedContentProvider>
              <AppStorageProvider>
                <CssBaseline />
                <App />
              </AppStorageProvider>
            </SavedContentProvider>
          </MediaStreamsProvider>
        </StrudelAudioStreamProvider>
      </StrudelAnalyzerProvider>
    </React.StrictMode>
  )
}
