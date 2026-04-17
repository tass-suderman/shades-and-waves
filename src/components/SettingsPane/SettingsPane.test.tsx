import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import SettingsPane from './SettingsPane'
import { themes } from '../../themes/Theme'

// Mock window.location.reload to avoid errors during test
const reloadMock = vi.fn()
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
})

describe('SettingsPane', () => {
  it('renders the Settings pane header', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders the Editor section', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByText('Editor')).toBeInTheDocument()
  })

  it('renders the Vim keybindings checkbox', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByRole('checkbox', { name: /vim keybindings/i })).toBeInTheDocument()
  })

  it('renders the Font size selector', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByText('Font size')).toBeInTheDocument()
  })

  it('renders the Theme section', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByText('Theme')).toBeInTheDocument()
  })

  it('renders all available theme options in the theme selector', async () => {
    renderWithProviders(<SettingsPane />)
    // Open the theme dropdown
    const selects = screen.getAllByRole('combobox')
    // Theme combobox is the second one (after font size)
    await userEvent.click(selects[1])
    await waitFor(() => {
      for (const theme of themes) {
        expect(screen.getByRole('option', { name: theme.label })).toBeInTheDocument()
      }
    })
  })

  it('renders the Keyboard Shortcuts section', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument()
  })

  it('renders the Saved Content section with the overwrite warning checkbox', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByRole('checkbox', { name: /warn before overwriting/i })).toBeInTheDocument()
  })

  it('renders the Data section with the Reset data button', () => {
    renderWithProviders(<SettingsPane />)
    expect(screen.getByRole('button', { name: /reset data/i })).toBeInTheDocument()
  })

  it('opens the reset confirmation dialog when Reset data is clicked', async () => {
    renderWithProviders(<SettingsPane />)
    await userEvent.click(screen.getByRole('button', { name: /reset data/i }))
    await waitFor(() => {
      expect(screen.getByText('Reset all data?')).toBeInTheDocument()
    })
  })

  it('closes the reset dialog and reloads on confirm', async () => {
    renderWithProviders(<SettingsPane />)
    await userEvent.click(screen.getByRole('button', { name: /reset data/i }))
    await userEvent.click(screen.getByRole('button', { name: /^reset$/i }))
    expect(reloadMock).toHaveBeenCalled()
  })

  it('closes the reset dialog on cancel without reloading', async () => {
    reloadMock.mockClear()
    renderWithProviders(<SettingsPane />)
    await userEvent.click(screen.getByRole('button', { name: /reset data/i }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(reloadMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Reset all data?')).not.toBeVisible()
  })
})
