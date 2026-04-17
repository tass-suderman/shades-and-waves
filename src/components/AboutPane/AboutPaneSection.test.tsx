import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPaneSection from './AboutPaneSection'

describe('AboutPaneSection', () => {
  it('renders children without a title', () => {
    render(<AboutPaneSection><span>Child content</span></AboutPaneSection>)
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders the title when provided', () => {
    render(<AboutPaneSection title="My Section"><span>Content</span></AboutPaneSection>)
    expect(screen.getByText('My Section')).toBeInTheDocument()
  })

  it('does not render a heading when title is omitted', () => {
    const { container } = render(<AboutPaneSection><span>Only content</span></AboutPaneSection>)
    expect(container.querySelector('h6')).toBeNull()
  })

  it('renders multiple children', () => {
    render(
      <AboutPaneSection title="Section">
        <span>First</span>
        <span>Second</span>
      </AboutPaneSection>
    )
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })
})
