import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { ViewReducer } from './ViewReducer'

// Mock all view components to avoid deep dependency chains
vi.mock('../DesktopView/DesktopView', () => ({
  DesktopView: ({ tabBar, editorContent }: { tabBar: React.ReactNode; editorContent: React.ReactNode }) => (
    <div data-testid="desktop-view">
      {tabBar}
      {editorContent}
    </div>
  ),
}))

vi.mock('../MobileView/MobileView', () => ({
  MobileView: ({ tabBar, editorContent }: { tabBar: React.ReactNode; editorContent: React.ReactNode }) => (
    <div data-testid="mobile-view">
      {tabBar}
      {editorContent}
    </div>
  ),
}))

vi.mock('../ImmersiveView/ImmersiveView', () => ({
  ImmersiveView: ({ tabBar, editorContent }: { tabBar: React.ReactNode; editorContent: React.ReactNode }) => (
    <div data-testid="immersive-view">
      {tabBar}
      {editorContent}
    </div>
  ),
}))

vi.mock('../EditorContent/EditorContent', () => ({
  EditorContent: ({ viewMode }: { viewMode: string }) => (
    <div data-testid="editor-content" data-view-mode={viewMode} />
  ),
}))

vi.mock('../TabBar/TabBar', () => ({
  TabBar: ({ viewMode, setViewMode }: { viewMode: string; setViewMode: (m: string) => void }) => (
    <div data-testid="tab-bar" data-view-mode={viewMode}>
      <button onClick={() => setViewMode('strudel')}>Strudel</button>
      <button onClick={() => setViewMode('about')}>About</button>
    </div>
  ),
}))

vi.mock('../OverwriteDialog/OverwriteDialog', () => ({
  OverwriteDialog: () => <div data-testid="overwrite-dialog" />,
}))

const shaderRef = { current: null } as React.RefObject<null>
const strudelRef = { current: null } as React.RefObject<null>

describe('ViewReducer', () => {
  it('renders the desktop view by default on non-mobile', () => {
    renderWithProviders(<ViewReducer shaderRef={shaderRef} strudelRef={strudelRef} />)
    expect(screen.getByTestId('desktop-view')).toBeInTheDocument()
  })

  it('renders the tab bar inside the desktop view', () => {
    renderWithProviders(<ViewReducer shaderRef={shaderRef} strudelRef={strudelRef} />)
    expect(screen.getByTestId('tab-bar')).toBeInTheDocument()
  })

  it('renders the editor content inside the desktop view', () => {
    renderWithProviders(<ViewReducer shaderRef={shaderRef} strudelRef={strudelRef} />)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders the overwrite dialog', () => {
    renderWithProviders(<ViewReducer shaderRef={shaderRef} strudelRef={strudelRef} />)
    expect(screen.getByTestId('overwrite-dialog')).toBeInTheDocument()
  })

  it('starts with the glsl view mode', () => {
    renderWithProviders(<ViewReducer shaderRef={shaderRef} strudelRef={strudelRef} />)
    expect(screen.getByTestId('tab-bar')).toHaveAttribute('data-view-mode', 'glsl')
  })

  it('updates the view mode when the tab bar triggers a change', async () => {
    renderWithProviders(<ViewReducer shaderRef={shaderRef} strudelRef={strudelRef} />)
    await userEvent.click(screen.getByRole('button', { name: 'Strudel' }))
    expect(screen.getByTestId('editor-content')).toHaveAttribute('data-view-mode', 'strudel')
  })
})
