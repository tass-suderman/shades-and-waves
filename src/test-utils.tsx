import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppStorageProvider } from './hooks/useAppStorage'
import { SavedContentProvider } from './hooks/useSavedContent'
import { StrudelAnalyzerProvider } from './hooks/useStrudelAnalyzer'
import { StrudelAudioStreamProvider } from './hooks/useStrudelAudioStream'
import { MediaStreamsProvider } from './hooks/useMediaStreams'

export function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <StrudelAnalyzerProvider>
      <StrudelAudioStreamProvider>
        <MediaStreamsProvider>
          <SavedContentProvider>
            <AppStorageProvider>
              {children}
            </AppStorageProvider>
          </SavedContentProvider>
        </MediaStreamsProvider>
      </StrudelAudioStreamProvider>
    </StrudelAnalyzerProvider>
  )
}

export function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options })
}
