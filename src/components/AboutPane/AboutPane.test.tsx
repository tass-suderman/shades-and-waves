import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AboutPane from './AboutPane'

describe('AboutPane', () => {
  it('renders the pane header with the correct title', () => {
    render(<AboutPane />)
    expect(screen.getByText('About Shades & Waves')).toBeInTheDocument()
  })

  it('renders the introductory description text', () => {
    render(<AboutPane />)
    expect(screen.getByText(/live-coding playground/i)).toBeInTheDocument()
  })

  it('renders the License section', () => {
    render(<AboutPane />)
    expect(screen.getByText('License')).toBeInTheDocument()
  })

  it('renders the Strudel section heading', () => {
    render(<AboutPane />)
    expect(screen.getByRole('heading', { name: 'Strudel' })).toBeInTheDocument()
  })

  it('renders the Sound Banks section', () => {
    render(<AboutPane />)
    expect(screen.getByText('Sound Banks')).toBeInTheDocument()
  })

  it('renders a link to the Strudel website', () => {
    render(<AboutPane />)
    const links = screen.getAllByRole('link', { name: /strudel/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', 'https://strudel.cc')
  })

  it('renders a link to the GitHub repository', () => {
    render(<AboutPane />)
    expect(
      screen.getByRole('link', { name: /github/i })
    ).toHaveAttribute('href', 'https://github.com/tass-suderman/shades-and-waves')
  })

  it('renders a link to the GNU AGPL license', () => {
    render(<AboutPane />)
    const agplLinks = screen.getAllByRole('link', { name: /gnu affero general public license/i })
    expect(agplLinks.length).toBeGreaterThan(0)
  })
})
