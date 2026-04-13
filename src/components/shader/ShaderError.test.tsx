import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ShaderError from './ShaderError'

describe('ShaderError', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ShaderError error={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the error message when error is provided', () => {
    render(<ShaderError error="ERROR: syntax error on line 3" />)
    expect(screen.getByText(/syntax error on line 3/i)).toBeInTheDocument()
  })

  it('renders multi-line error messages', () => {
    render(<ShaderError error={'line 1 error\nline 2 error'} />)
    expect(screen.getByText(/line 1 error/i)).toBeInTheDocument()
  })

  it('renders nothing when error is empty string (falsy)', () => {
    // Empty string is falsy – treat as no error
    const { container } = render(<ShaderError error={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a dismiss button with accessible label when an error is shown', () => {
    render(<ShaderError error="ERROR: something went wrong" />)
    expect(screen.getByRole('button', { name: /dismiss error/i })).toBeInTheDocument()
  })

  it('hides the error panel when the dismiss button is clicked', async () => {
    const user = userEvent.setup()
    render(<ShaderError error="ERROR: something went wrong" />)
    const dismissBtn = screen.getByRole('button', { name: /dismiss error/i })
    await user.click(dismissBtn)
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })
})
