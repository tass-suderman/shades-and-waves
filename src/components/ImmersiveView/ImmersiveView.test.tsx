import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import React from 'react'
import { renderWithProviders } from '../../test-utils'
import { ImmersiveView } from './ImmersiveView'

// ShaderPane uses WebGL – replace with a simple stub
vi.mock('../ShaderPane/ShaderPane', () => ({
  default: React.forwardRef((_props: object, _ref: React.ForwardedRef<unknown>) => (
    <div data-testid="shader-pane" />
  )),
}))

// ShaderControls uses AppStorage but we provide that via providers
vi.mock('../ShaderControls/ShaderControls', () => ({
  default: ({ onToggleImmersive }: { onToggleImmersive: () => void }) => (
    <div data-testid="shader-controls">
      <button onClick={onToggleImmersive}>Exit Immersive</button>
    </div>
  ),
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
  isMobile: false,
  handleToggleImmersive: vi.fn(),
}

describe('ImmersiveView', () => {
  it('renders the shader pane as background layer', () => {
    renderWithProviders(<ImmersiveView {...defaultProps} />)
    expect(screen.getByTestId('shader-pane')).toBeInTheDocument()
  })

  it('renders the tab bar inside the overlay', () => {
    renderWithProviders(<ImmersiveView {...defaultProps} />)
    expect(screen.getByTestId('tab-bar')).toBeInTheDocument()
  })

  it('renders the editor content inside the overlay', () => {
    renderWithProviders(<ImmersiveView {...defaultProps} />)
    expect(screen.getByTestId('editor-content')).toBeInTheDocument()
  })

  it('renders the shader controls bar', () => {
    renderWithProviders(<ImmersiveView {...defaultProps} />)
    expect(screen.getByTestId('shader-controls')).toBeInTheDocument()
  })

  it('calls handleToggleImmersive when the immersive toggle button is clicked', async () => {
    const handleToggleImmersive = vi.fn()
    const { getByRole } = renderWithProviders(
      <ImmersiveView {...defaultProps} handleToggleImmersive={handleToggleImmersive} />
    )
    const button = getByRole('button', { name: 'Exit Immersive' })
    button.click()
    expect(handleToggleImmersive).toHaveBeenCalled()
  })
})
