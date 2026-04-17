import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InformationPanel } from './InformationPanel'

describe('InformationPanel', () => {
  it('renders each item using the renderer', () => {
    const items = ['Alpha', 'Beta', 'Gamma']
    const renderer = (item: string) => <div key={item} data-testid="item">{item}</div>

    render(
      <InformationPanel renderer={renderer} items={items} footer={null} />
    )

    const rendered = screen.getAllByTestId('item')
    expect(rendered).toHaveLength(3)
    expect(rendered[0]).toHaveTextContent('Alpha')
    expect(rendered[1]).toHaveTextContent('Beta')
    expect(rendered[2]).toHaveTextContent('Gamma')
  })

  it('renders the footer', () => {
    render(
      <InformationPanel
        renderer={() => null}
        items={[]}
        footer={<footer data-testid="footer">Footer content</footer>}
      />
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders nothing when items is empty and footer is null', () => {
    const { container } = render(
      <InformationPanel renderer={() => null} items={[]} footer={null} />
    )
    // The outer Box should still be present
    expect(container.firstChild).toBeInTheDocument()
  })
})
