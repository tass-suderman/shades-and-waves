import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UniformsModal from './UniformsModal'

describe('UniformsModal', () => {
  it('is not visible when open=false', () => {
    render(<UniformsModal open={false} onClose={vi.fn()} />)
    expect(screen.queryByText(/available uniforms/i)).not.toBeInTheDocument()
  })

  it('is visible when open=true', () => {
    render(<UniformsModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText(/available uniforms/i)).toBeInTheDocument()
  })

  it('renders all uniform names', () => {
    render(<UniformsModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText('iTime')).toBeInTheDocument()
    expect(screen.getByText('iResolution')).toBeInTheDocument()
    expect(screen.getByText('iMouse')).toBeInTheDocument()
    expect(screen.getByText('iFrame')).toBeInTheDocument()
    expect(screen.getByText('iChannel0')).toBeInTheDocument()
    expect(screen.getByText('iChannel1')).toBeInTheDocument()
    expect(screen.getByText('iChannel2')).toBeInTheDocument()
  })

  it('renders uniform types', () => {
    render(<UniformsModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText('float')).toBeInTheDocument()
    expect(screen.getAllByText('sampler2D').length).toBeGreaterThan(0)
    expect(screen.getAllByText('bool').length).toBeGreaterThan(0)
  })

  it('renders uniform descriptions', () => {
    render(<UniformsModal open={true} onClose={vi.fn()} />)
    expect(screen.getByText(/shader playback time/i)).toBeInTheDocument()
    expect(screen.getByText(/viewport resolution/i)).toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    render(<UniformsModal open={true} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close uniforms dialog/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
