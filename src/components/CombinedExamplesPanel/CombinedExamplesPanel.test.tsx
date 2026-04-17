import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CombinedExamplesPanel from './CombinedExamplesPanel'

const glslIndex = [
  { id: 'waves', title: 'Waves' },
  { id: 'kaleidoscope', title: 'Kaleidoscope', aiGenerated: true },
]
const strudelIndex = [
  { id: 'beat', title: 'Simple Beat' },
]

function mockFetch(url: string): Promise<Response> {
  if (url.includes('glsl/index.json')) {
    return Promise.resolve(new Response(JSON.stringify(glslIndex), { status: 200 }))
  }
  if (url.includes('strudel/index.json')) {
    return Promise.resolve(new Response(JSON.stringify(strudelIndex), { status: 200 }))
  }
  if (url.includes('glsl/waves.glsl')) {
    return Promise.resolve(new Response('void main() {}', { status: 200 }))
  }
  if (url.includes('strudel/beat.strudel')) {
    return Promise.resolve(new Response('note("c3")', { status: 200 }))
  }
  return Promise.reject(new Error(`Unexpected URL: ${url}`))
}

describe('CombinedExamplesPanel', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(mockFetch))
  })

  it('renders both section headings after loading', async () => {
    render(<CombinedExamplesPanel onLoadGlsl={vi.fn()} onLoadStrudel={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Shaders')).toBeInTheDocument()
      expect(screen.getByText('Patterns')).toBeInTheDocument()
    })
  })

  it('renders the fetched GLSL example titles', async () => {
    render(<CombinedExamplesPanel onLoadGlsl={vi.fn()} onLoadStrudel={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Waves')).toBeInTheDocument()
      expect(screen.getByText('Kaleidoscope')).toBeInTheDocument()
    })
  })

  it('renders the fetched Strudel example titles', async () => {
    render(<CombinedExamplesPanel onLoadGlsl={vi.fn()} onLoadStrudel={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getByText('Simple Beat')).toBeInTheDocument()
    })
  })

  it('shows the load confirmation dialog when an example is clicked', async () => {
    render(<CombinedExamplesPanel onLoadGlsl={vi.fn()} onLoadStrudel={vi.fn()} />)
    await waitFor(() => screen.getByText('Waves'))
    await userEvent.click(screen.getByText('Waves'))
    expect(screen.getByText('Load example?')).toBeInTheDocument()
  })

  it('calls onLoadGlsl when a GLSL example is confirmed', async () => {
    const onLoadGlsl = vi.fn()
    render(<CombinedExamplesPanel onLoadGlsl={onLoadGlsl} onLoadStrudel={vi.fn()} />)
    await waitFor(() => screen.getByText('Waves'))
    await userEvent.click(screen.getByText('Waves'))
    await userEvent.click(screen.getByRole('button', { name: 'Load' }))
    await waitFor(() => {
      expect(onLoadGlsl).toHaveBeenCalledWith('Waves', 'void main() {}')
    })
  })

  it('calls onLoadStrudel when a Strudel example is confirmed', async () => {
    const onLoadStrudel = vi.fn()
    render(<CombinedExamplesPanel onLoadGlsl={vi.fn()} onLoadStrudel={onLoadStrudel} />)
    await waitFor(() => screen.getByText('Simple Beat'))
    await userEvent.click(screen.getByText('Simple Beat'))
    await userEvent.click(screen.getByRole('button', { name: 'Load' }))
    await waitFor(() => {
      expect(onLoadStrudel).toHaveBeenCalledWith('Simple Beat', 'note("c3")')
    })
  })

  it('closes the dialog on cancel without calling callbacks', async () => {
    const onLoadGlsl = vi.fn()
    render(<CombinedExamplesPanel onLoadGlsl={onLoadGlsl} onLoadStrudel={vi.fn()} />)
    await waitFor(() => screen.getByText('Waves'))
    await userEvent.click(screen.getByText('Waves'))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onLoadGlsl).not.toHaveBeenCalled()
    expect(screen.queryByText('Load example?')).not.toBeVisible()
  })

  it('shows an error message when the index fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network error'))))
    render(<CombinedExamplesPanel onLoadGlsl={vi.fn()} onLoadStrudel={vi.fn()} />)
    await waitFor(() => {
      expect(screen.getAllByText('Failed to load examples.').length).toBeGreaterThan(0)
    })
  })
})
