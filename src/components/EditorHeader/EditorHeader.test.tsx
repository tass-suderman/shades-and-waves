import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EditorHeader from './EditorHeader'

const baseProps = {
  title: 'Fragment Shader',
  onTitleChange: vi.fn(),
  onImport: vi.fn(),
  onExport: vi.fn(),
  onSave: vi.fn(),
  onRun: vi.fn(),
}

describe('EditorHeader', () => {
  it('renders the title input with the correct value', () => {
    render(<EditorHeader {...baseProps} />)
    expect(screen.getByDisplayValue('Fragment Shader')).toBeInTheDocument()
  })

  it('renders the Run button', () => {
    render(<EditorHeader {...baseProps} />)
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
  })

  it('calls onRun when the Run button is clicked', async () => {
    const onRun = vi.fn()
    render(<EditorHeader {...baseProps} onRun={onRun} />)
    await userEvent.click(screen.getByRole('button', { name: /run/i }))
    expect(onRun).toHaveBeenCalledOnce()
  })

  it('renders import and export buttons', () => {
    render(<EditorHeader {...baseProps} />)
    expect(screen.getByRole('button', { name: /import from file/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export to file/i })).toBeInTheDocument()
  })

  it('calls onImport when the import button is clicked', async () => {
    const onImport = vi.fn()
    render(<EditorHeader {...baseProps} onImport={onImport} />)
    await userEvent.click(screen.getByRole('button', { name: /import from file/i }))
    expect(onImport).toHaveBeenCalledOnce()
  })

  it('calls onExport when the export button is clicked', async () => {
    const onExport = vi.fn()
    render(<EditorHeader {...baseProps} onExport={onExport} />)
    await userEvent.click(screen.getByRole('button', { name: /export to file/i }))
    expect(onExport).toHaveBeenCalledOnce()
  })

  it('renders the Save button and calls onSave when clicked', async () => {
    const onSave = vi.fn()
    render(<EditorHeader {...baseProps} onSave={onSave} />)
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('shows the sounds button only when onShowSounds is provided', () => {
    const { rerender } = render(<EditorHeader {...baseProps} />)
    expect(screen.queryByRole('button', { name: /available sounds/i })).toBeNull()

    rerender(<EditorHeader {...baseProps} onShowSounds={vi.fn()} />)
    expect(screen.getByRole('button', { name: /available sounds/i })).toBeInTheDocument()
  })

  it('shows the uniforms button only when onShowUniforms is provided', () => {
    const { rerender } = render(<EditorHeader {...baseProps} />)
    expect(screen.queryByRole('button', { name: /available uniforms/i })).toBeNull()

    rerender(<EditorHeader {...baseProps} onShowUniforms={vi.fn()} />)
    expect(screen.getByRole('button', { name: /available uniforms/i })).toBeInTheDocument()
  })

  it('renders the Stop button only when onStop is provided', () => {
    const { rerender } = render(<EditorHeader {...baseProps} />)
    expect(screen.queryByRole('button', { name: /stop/i })).toBeNull()

    rerender(<EditorHeader {...baseProps} onStop={vi.fn()} />)
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument()
  })

  it('disables Stop button when isPlaying is false', () => {
    render(<EditorHeader {...baseProps} onStop={vi.fn()} isPlaying={false} />)
    expect(screen.getByRole('button', { name: /stop/i })).toBeDisabled()
  })

  it('enables Stop button when isPlaying is true', () => {
    render(<EditorHeader {...baseProps} onStop={vi.fn()} isPlaying={true} />)
    expect(screen.getByRole('button', { name: /stop/i })).not.toBeDisabled()
  })

  it('uses a custom run label when provided', () => {
    render(<EditorHeader {...baseProps} runLabel="Play" />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('uses a custom title aria-label when provided', () => {
    render(<EditorHeader {...baseProps} titleAriaLabel="Shader name" />)
    expect(screen.getByRole('textbox', { name: 'Shader name' })).toBeInTheDocument()
  })
})
