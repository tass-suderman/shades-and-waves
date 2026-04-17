import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { EditorContent } from './EditorContent'

// Mock heavy sub-components
vi.mock('../EditorPane/EditorPane', () => ({
  default: React.forwardRef((_props: object, _ref: React.ForwardedRef<unknown>) => (
    <div data-testid="editor-pane" />
  )),
}))

vi.mock('../StrudelPane/StrudelPane', () => ({
  default: React.forwardRef((_props: object, _ref: React.ForwardedRef<unknown>) => (
    <div data-testid="strudel-pane" />
  )),
}))

vi.mock('../AboutPane/AboutPane', () => ({
  default: () => <div data-testid="about-pane" />,
}))

vi.mock('../SettingsPane/SettingsPane', () => ({
  default: () => <div data-testid="settings-pane" />,
}))

vi.mock('../SavedPane/SavedPane', () => ({
  default: () => <div data-testid="saved-pane" />,
}))

const strudelRef = { current: null } as React.RefObject<null>

const baseProps = {
  viewMode: 'glsl' as const,
  initialShaderCode: 'void main() {}',
  shaderError: null,
  strudelRef,
  setShaderSource: vi.fn(),
  setViewMode: vi.fn(),
  setOverwritePending: vi.fn(),
  setOverwriteDialogOpen: vi.fn(),
  setDontShowAgain: vi.fn(),
  commitSave: vi.fn(),
}

describe('EditorContent', () => {
  it('renders the GLSL editor pane when viewMode is "glsl"', () => {
    renderWithProviders(<EditorContent {...baseProps} viewMode="glsl" />)
    expect(screen.getByTestId('editor-pane')).toBeInTheDocument()
  })

  it('renders the Strudel pane when viewMode is "strudel"', () => {
    renderWithProviders(<EditorContent {...baseProps} viewMode="strudel" />)
    // Strudel pane is mounted (display:flex) for strudel view
    expect(screen.getByTestId('strudel-pane')).toBeInTheDocument()
  })

  it('renders the About pane when viewMode is "about"', () => {
    renderWithProviders(<EditorContent {...baseProps} viewMode="about" />)
    expect(screen.getByTestId('about-pane')).toBeInTheDocument()
  })

  it('renders the Settings pane when viewMode is "settings"', () => {
    renderWithProviders(<EditorContent {...baseProps} viewMode="settings" />)
    expect(screen.getByTestId('settings-pane')).toBeInTheDocument()
  })

  it('renders the Saved pane when viewMode is "saved"', () => {
    renderWithProviders(<EditorContent {...baseProps} viewMode="saved" />)
    expect(screen.getByTestId('saved-pane')).toBeInTheDocument()
  })

  it('keeps both EditorPane and StrudelPane mounted regardless of view mode', () => {
    // Both are always mounted (display toggled), so they appear in all views
    renderWithProviders(<EditorContent {...baseProps} viewMode="about" />)
    expect(screen.getByTestId('editor-pane')).toBeInTheDocument()
    expect(screen.getByTestId('strudel-pane')).toBeInTheDocument()
  })
})
