import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SavedSection from './SavedSection'
import { SavedEntry } from '../../hooks/useSavedContent'

const makeEntries = (titles: string[]): SavedEntry[] =>
  titles.map((title, i) => ({ title, content: `content-${i}`, savedAt: Date.now() }))

describe('SavedSection', () => {
  it('renders nothing when entries is empty', () => {
    const { container } = render(
      <SavedSection heading="Shaders" entries={[]} ext="glsl" onLoad={vi.fn()} onDelete={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the heading when entries are present', () => {
    render(
      <SavedSection
        heading="Shaders"
        entries={makeEntries(['My Shader'])}
        ext="glsl"
        onLoad={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Shaders')).toBeInTheDocument()
  })

  it('renders a list item for each entry', () => {
    render(
      <SavedSection
        heading="Patterns"
        entries={makeEntries(['Pat A', 'Pat B', 'Pat C'])}
        ext="strudel"
        onLoad={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('Pat A')).toBeInTheDocument()
    expect(screen.getByText('Pat B')).toBeInTheDocument()
    expect(screen.getByText('Pat C')).toBeInTheDocument()
  })

  it('calls onLoad with the correct title and content when an entry is clicked', async () => {
    const onLoad = vi.fn()
    const entries = makeEntries(['Awesome Shader'])
    render(
      <SavedSection heading="Shaders" entries={entries} ext="glsl" onLoad={onLoad} onDelete={vi.fn()} />
    )
    await userEvent.click(screen.getByText('Awesome Shader'))
    expect(onLoad).toHaveBeenCalledWith('Awesome Shader', 'content-0')
  })

  it('calls onDelete with the correct title when the delete button is clicked', async () => {
    const onDelete = vi.fn()
    render(
      <SavedSection
        heading="Shaders"
        entries={makeEntries(['Shader X'])}
        ext="glsl"
        onLoad={vi.fn()}
        onDelete={onDelete}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: /delete shader x/i }))
    expect(onDelete).toHaveBeenCalledWith('Shader X')
  })

  it('shows "Delete shader" tooltip label for glsl entries', () => {
    render(
      <SavedSection
        heading="Shaders"
        entries={makeEntries(['My GLSL'])}
        ext="glsl"
        onLoad={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /delete my glsl/i })).toBeInTheDocument()
  })

  it('shows "Delete pattern" tooltip label for strudel entries', () => {
    render(
      <SavedSection
        heading="Patterns"
        entries={makeEntries(['My Pattern'])}
        ext="strudel"
        onLoad={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: /delete my pattern/i })).toBeInTheDocument()
  })
})
