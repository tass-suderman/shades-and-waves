import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import SavedPane from './SavedPane'

// Mock CombinedExamplesPanel to avoid fetch side effects in this test suite
vi.mock('../CombinedExamplesPanel/CombinedExamplesPanel', () => ({
  default: () => <div data-testid="combined-examples-panel" />,
}))

const defaultProps = {
  onLoadShader: vi.fn(),
  onLoadPattern: vi.fn(),
  onLoadGlslExample: vi.fn(),
  onLoadStrudelExample: vi.fn(),
}

describe('SavedPane', () => {
  it('renders the "Saved" pane header', () => {
    renderWithProviders(<SavedPane {...defaultProps} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('renders the Examples section heading', () => {
    renderWithProviders(<SavedPane {...defaultProps} />)
    expect(screen.getByText('Examples')).toBeInTheDocument()
  })

  it('renders the CombinedExamplesPanel', () => {
    renderWithProviders(<SavedPane {...defaultProps} />)
    expect(screen.getByTestId('combined-examples-panel')).toBeInTheDocument()
  })

  it('does not show saved content section when there are no saved items', () => {
    renderWithProviders(<SavedPane {...defaultProps} />)
    expect(screen.queryByText('Saved Content')).toBeNull()
  })

  it('does not show export button when there are no saved items', () => {
    renderWithProviders(<SavedPane {...defaultProps} />)
    expect(screen.queryByRole('button', { name: /export all saved content/i })).toBeNull()
  })

  it('shows Saved Content section and export button when items exist', async () => {
    // Pre-populate localStorage with a saved shader so the provider picks it up
    localStorage.setItem(
      'shader-playground:saved-shaders',
      JSON.stringify([{ title: 'Test Shader', content: 'code', savedAt: Date.now() }])
    )
    renderWithProviders(<SavedPane {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByText('Saved Content')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /export all saved content/i })).toBeInTheDocument()
    localStorage.removeItem('shader-playground:saved-shaders')
  })

  it('shows a delete dialog when delete is triggered on a saved shader', async () => {
    localStorage.setItem(
      'shader-playground:saved-shaders',
      JSON.stringify([{ title: 'Shader To Delete', content: 'code', savedAt: Date.now() }])
    )
    renderWithProviders(<SavedPane {...defaultProps} />)
    await waitFor(() => screen.getByText('Shader To Delete'))
    await userEvent.click(screen.getByRole('button', { name: /delete shader to delete/i }))
    // The DeleteItemDialog should be visible
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    localStorage.removeItem('shader-playground:saved-shaders')
  })
})
