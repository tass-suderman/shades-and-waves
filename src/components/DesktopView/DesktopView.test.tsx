import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { DesktopView } from './DesktopView'

// ShaderPane uses WebGL – replace with a simple stub
vi.mock('../ShaderPane/ShaderPane', () => ({
  default: React.forwardRef((_props: object, _ref: React.ForwardedRef<unknown>) => (
    <div data-testid="shader-pane" />
  )),
}))

const shaderRef = { current: null } as React.RefObject<null>
const outerContainerRef = React.createRef<HTMLDivElement>()

const defaultProps = {
  outerContainerRef,
  shaderRef,
  tabBar: <div data-testid="tab-bar" />,
  editorContent: <div data-testid="editor-content" />,
  shaderSource: 'void main() {}',
  setShaderError: vi.fn(),
  handleToggleImmersive: vi.fn(),
  editorCollapsed: false,
  setEditorCollapsed: vi.fn(),
}

describe('DesktopView', () => {
  it('renders the shader pane', () => {
    renderWithProviders(<DesktopView {...defaultProps} />)
    expect(screen.getByTestId('shader-pane')).toBeInTheDocument()
  })

  it('renders the tab bar', () => {
    renderWithProviders(<DesktopView {...defaultProps} />)
    expect(screen.getByTestId('tab-bar')).toBeInTheDocument()
  })

  it('renders the editor content', () => {
    renderWithProviders(<DesktopView {...defaultProps} />)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('hides editor content when editorCollapsed is true', () => {
    renderWithProviders(<DesktopView {...defaultProps} editorCollapsed={true} />)
    // The editor area is inside a Collapse with `in={false}` – it should not be visible
    const editorContent = screen.queryByTestId('editor-content')
    // MUI Collapse hides content using CSS; the element may still be in DOM but hidden
    if (editorContent) {
      expect(editorContent).not.toBeVisible()
    } else {
      // If not in DOM at all, that's also correct
      expect(editorContent).toBeNull()
    }
  })

  it('renders both shader pane and editor panel when editor is not collapsed', () => {
    renderWithProviders(<DesktopView {...defaultProps} editorCollapsed={false} />)
    expect(screen.getByTestId('shader-pane')).toBeInTheDocument()
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders only the shader pane when editor is collapsed', () => {
    renderWithProviders(<DesktopView {...defaultProps} editorCollapsed={true} />)
    expect(screen.getByTestId('shader-pane')).toBeInTheDocument()
    // Editor content should not be visible when collapsed
    const editorContent = screen.queryByTestId('editor-content')
    if (editorContent) {
      expect(editorContent).not.toBeVisible()
    } else {
      expect(editorContent).toBeNull()
    }
  })
})
