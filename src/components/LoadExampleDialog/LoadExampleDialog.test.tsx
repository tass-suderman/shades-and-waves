import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoadExampleDialog from './LoadExampleDialog'

const defaultProps = {
  confirmOpen: true,
  title: 'Cool Shader',
  itemLabel: 'shader',
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
}

describe('LoadExampleDialog', () => {
  it('renders the dialog when confirmOpen is true', () => {
    render(<LoadExampleDialog {...defaultProps} />)
    expect(screen.getByText('Load example?')).toBeInTheDocument()
  })

  it('does not render dialog content when confirmOpen is false', () => {
    render(<LoadExampleDialog {...defaultProps} confirmOpen={false} />)
    expect(screen.queryByText('Load example?')).toBeNull()
  })

  it('displays the example title in the description', () => {
    render(<LoadExampleDialog {...defaultProps} />)
    expect(screen.getByText('Cool Shader')).toBeInTheDocument()
  })

  it('displays the item label in the description', () => {
    render(<LoadExampleDialog {...defaultProps} />)
    expect(screen.getByText(/shader/)).toBeInTheDocument()
  })

  it('calls onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(<LoadExampleDialog {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when the Load button is clicked', async () => {
    const onConfirm = vi.fn()
    render(<LoadExampleDialog {...defaultProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Load' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when the close icon button is clicked', async () => {
    const onCancel = vi.fn()
    render(<LoadExampleDialog {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
