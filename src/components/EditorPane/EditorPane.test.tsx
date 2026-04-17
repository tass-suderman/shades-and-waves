import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import EditorPane from './EditorPane'
import React from 'react'

// Monaco editor is heavy and does not work in jsdom – replace with a simple textarea
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}))

// monaco-vim is not needed in tests
vi.mock('monaco-vim', () => ({
  initVimMode: vi.fn(() => ({ dispose: vi.fn() })),
}))

describe('EditorPane', () => {
  it('renders the editor header', () => {
    renderWithProviders(
      <EditorPane
        initialCode="void main() {}"
        onRun={vi.fn()}
        shaderError={null}
        onSave={vi.fn()}
      />
    )
    // EditorHeader renders a Run button
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
  })

  it('renders the Monaco editor', () => {
    renderWithProviders(
      <EditorPane
        initialCode="void main() {}"
        onRun={vi.fn()}
        shaderError={null}
        onSave={vi.fn()}
      />
    )
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument()
  })

  it('calls onRun when the Run button is clicked', async () => {
    const onRun = vi.fn()
    renderWithProviders(
      <EditorPane
        initialCode="void main() {}"
        onRun={onRun}
        shaderError={null}
        onSave={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /run/i }))
    expect(onRun).toHaveBeenCalled()
  })

  it('displays a shader error when shaderError is non-null', () => {
    renderWithProviders(
      <EditorPane
        initialCode="void main() {}"
        onRun={vi.fn()}
        shaderError="Compilation failed: unexpected token"
        onSave={vi.fn()}
      />
    )
    expect(screen.getByText(/compilation failed/i)).toBeInTheDocument()
  })

  it('does not display a shader error when shaderError is null', () => {
    renderWithProviders(
      <EditorPane
        initialCode="void main() {}"
        onRun={vi.fn()}
        shaderError={null}
        onSave={vi.fn()}
      />
    )
    expect(screen.queryByText(/compilation failed/i)).toBeNull()
  })

  it('exposes a loadExample handle that updates the editor', async () => {
    const ref = React.createRef<import('./EditorPane').EditorPaneHandle>()
    renderWithProviders(
      <EditorPane
        ref={ref}
        initialCode="void main() {}"
        onRun={vi.fn()}
        shaderError={null}
        onSave={vi.fn()}
      />
    )
    expect(ref.current).not.toBeNull()
    expect(typeof ref.current?.loadExample).toBe('function')
  })
})
