import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ResetConfirmationDialog from './ResetConfirmationDialog'

describe('ResetConfirmationDialog', () => {
  it('renders when open is true', () => {
    render(
      <ResetConfirmationDialog open={true} onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(screen.getByText('Reset all data?')).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', () => {
    render(
      <ResetConfirmationDialog open={false} onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(screen.queryByText('Reset all data?')).toBeNull()
  })

  it('shows descriptive text about the action', () => {
    render(
      <ResetConfirmationDialog open={true} onCancel={vi.fn()} onConfirm={vi.fn()} />
    )
    expect(screen.getByText(/permanently delete/i)).toBeInTheDocument()
  })

  it('calls onCancel when the Cancel button is clicked', async () => {
    const onCancel = vi.fn()
    render(
      <ResetConfirmationDialog open={true} onCancel={onCancel} onConfirm={vi.fn()} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when the Reset button is clicked', async () => {
    const onConfirm = vi.fn()
    render(
      <ResetConfirmationDialog open={true} onCancel={vi.fn()} onConfirm={onConfirm} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
