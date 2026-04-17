import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TabBar } from './TabBar'
import { tabConfigs } from '../../constants/tabConfigs'

const mockStrudelRef = { current: { closeSounds: vi.fn() } }

describe('TabBar', () => {
  it('renders a tab button for each tab config', () => {
    render(
      <TabBar viewMode="glsl" setViewMode={vi.fn()} strudelRef={mockStrudelRef} />
    )
    for (const tab of tabConfigs) {
      expect(screen.getByRole('button', { name: tab.label })).toBeInTheDocument()
    }
  })

  it('marks the active tab as selected', () => {
    render(
      <TabBar viewMode="strudel" setViewMode={vi.fn()} strudelRef={mockStrudelRef} />
    )
    const strudelBtn = screen.getByRole('button', { name: 'Strudel' })
    expect(strudelBtn).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls setViewMode with the clicked tab value', async () => {
    const setViewMode = vi.fn()
    render(
      <TabBar viewMode="glsl" setViewMode={setViewMode} strudelRef={mockStrudelRef} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Saved' }))
    expect(setViewMode).toHaveBeenCalledWith('saved')
  })

  it('calls closeSounds on the strudel ref when a tab is selected', async () => {
    const closeSounds = vi.fn()
    const strudelRef = { current: { closeSounds } }
    render(
      <TabBar viewMode="glsl" setViewMode={vi.fn()} strudelRef={strudelRef} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'About' }))
    expect(closeSounds).toHaveBeenCalled()
  })

  it('does not call setViewMode when the already-active tab is re-clicked', async () => {
    const setViewMode = vi.fn()
    render(
      <TabBar viewMode="glsl" setViewMode={setViewMode} strudelRef={mockStrudelRef} />
    )
    // ToggleButtonGroup with exclusive will not call onChange when deselecting
    await userEvent.click(screen.getByRole('button', { name: 'GLSL' }))
    expect(setViewMode).not.toHaveBeenCalled()
  })
})
