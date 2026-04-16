// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock hooks used internally by SettingsPane
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(),
}))
vi.mock('../../hooks/useAppStorage', () => ({
  useAppStorage: vi.fn(),
}))

import { useTheme } from '../../hooks/useTheme'
import { useAppStorage } from '../../hooks/useAppStorage'
import SettingsPane from './SettingsPane'

const mockUseTheme = useTheme as ReturnType<typeof vi.fn>
const mockUseAppStorage = useAppStorage as ReturnType<typeof vi.fn>

const DEFAULT_THEME = {
  changeTheme: vi.fn(),
  currentTheme: { name: 'kanagawa', label: 'Kanagawa' },
  muiTheme: {},
}

const DEFAULT_STORAGE = {
  vimMode: false,
  setVimMode: vi.fn(),
  fontSize: 13,
  setFontSize: vi.fn(),
  warnOnOverwrite: true,
  setWarnOnOverwrite: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseTheme.mockReturnValue({ ...DEFAULT_THEME })
  mockUseAppStorage.mockReturnValue({ ...DEFAULT_STORAGE })
})

describe('SettingsPane', () => {
  it('renders Settings heading', () => {
    render(<SettingsPane />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders vim keybindings checkbox unchecked when vimMode is false', () => {
    mockUseAppStorage.mockReturnValue({ ...DEFAULT_STORAGE, vimMode: false })
    render(<SettingsPane />)
    const checkbox = screen.getByRole('checkbox', { name: /vim keybindings/i })
    expect(checkbox).not.toBeChecked()
  })

  it('renders vim keybindings checkbox checked when vimMode is true', () => {
    mockUseAppStorage.mockReturnValue({ ...DEFAULT_STORAGE, vimMode: true })
    render(<SettingsPane />)
    const checkbox = screen.getByRole('checkbox', { name: /vim keybindings/i })
    expect(checkbox).toBeChecked()
  })

  it('calls setVimMode when vim checkbox is clicked', async () => {
    const setVimMode = vi.fn()
    mockUseAppStorage.mockReturnValue({ ...DEFAULT_STORAGE, setVimMode })
    const user = userEvent.setup()
    render(<SettingsPane />)
    await user.click(screen.getByRole('checkbox', { name: /vim keybindings/i }))
    expect(setVimMode).toHaveBeenCalledTimes(1)
  })

  it('renders warn on overwrite checkbox checked by default', () => {
    render(<SettingsPane />)
    expect(screen.getByRole('checkbox', { name: /warn before overwriting/i })).toBeChecked()
  })

  it('renders the Keyboard Shortcuts section', () => {
    render(<SettingsPane />)
    expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument()
  })

  it('renders the theme selector', () => {
    render(<SettingsPane />)
    expect(screen.getByText(/theme/i)).toBeInTheDocument()
  })

  it('renders the Reset data button', () => {
    render(<SettingsPane />)
    expect(screen.getByRole('button', { name: /reset data/i })).toBeInTheDocument()
  })

  it('opens reset confirmation dialog when Reset data is clicked', async () => {
    const user = userEvent.setup()
    render(<SettingsPane />)
    await user.click(screen.getByRole('button', { name: /reset data/i }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})
