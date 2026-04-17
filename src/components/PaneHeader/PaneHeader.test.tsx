import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PaneHeader from './PaneHeader'

describe('PaneHeader', () => {
  it('renders the title text when provided', () => {
    render(<PaneHeader title="My Pane" />)
    expect(screen.getByText('My Pane')).toBeInTheDocument()
  })

  it('does not render a title element when title is omitted', () => {
    const { container } = render(<PaneHeader />)
    // No subtitle2 typography should appear for the title
    expect(container.querySelector('h6, p')).toBeNull()
  })

  it('renders children alongside the title', () => {
    render(
      <PaneHeader title="Header">
        <button>Action</button>
      </PaneHeader>
    )
    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders only children when no title is given', () => {
    render(
      <PaneHeader>
        <span data-testid="child">child content</span>
      </PaneHeader>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
