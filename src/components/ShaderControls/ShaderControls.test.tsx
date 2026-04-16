// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock hooks used internally by ShaderControls
vi.mock('../../hooks/useAppStorage', () => ({
  useAppStorage: vi.fn(),
}))
vi.mock('../../hooks/useMediaStreams', () => ({
  useMediaStreams: vi.fn(),
}))
vi.mock('../../hooks/useStrudelAnalyzer', () => ({
  useStrudelAnalyzer: vi.fn(),
}))

import { useAppStorage } from '../../hooks/useAppStorage'
import { useMediaStreams } from '../../hooks/useMediaStreams'
import { useStrudelAnalyzer } from '../../hooks/useStrudelAnalyzer'
import ShaderControls from './ShaderControls'

const mockUseAppStorage = useAppStorage as ReturnType<typeof vi.fn>
const mockUseMediaStreams = useMediaStreams as ReturnType<typeof vi.fn>
const mockUseStrudelAnalyzer = useStrudelAnalyzer as ReturnType<typeof vi.fn>

const DEFAULT_APP_STORAGE = {
  muted: false,
  setMuted: vi.fn(),
  volume: 50,
  setVolume: vi.fn(),
  immersiveOpacity: 50,
  setImmersiveOpacity: vi.fn(),
}

const DEFAULT_MEDIA_STREAMS = {
  webcamEnabled: false,
  micEnabled: false,
  handleToggleWebcam: vi.fn(),
  handleToggleMic: vi.fn(),
}

const DEFAULT_PROPS = {
  isPlaying: true,
  isRecording: false,
  isFullscreen: false,
  onTogglePlay: vi.fn(),
  onStartRecording: vi.fn(),
  onStopRecording: vi.fn(),
  onToggleFullscreen: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAppStorage.mockReturnValue({ ...DEFAULT_APP_STORAGE })
  mockUseMediaStreams.mockReturnValue({ ...DEFAULT_MEDIA_STREAMS })
  mockUseStrudelAnalyzer.mockReturnValue({ analyzer: null })
})

describe('ShaderControls', () => {
  it('shows Start Recording button when not recording', () => {
    render(<ShaderControls {...DEFAULT_PROPS} isRecording={false} />)
    expect(screen.getByRole('button', { name: /start recording/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /stop recording/i })).not.toBeInTheDocument()
  })

  it('shows Stop Recording button when recording', () => {
    render(<ShaderControls {...DEFAULT_PROPS} isRecording={true} />)
    expect(screen.getByRole('button', { name: /stop recording/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /start recording/i })).not.toBeInTheDocument()
  })

  it('shows Pause button when playing', () => {
    render(<ShaderControls {...DEFAULT_PROPS} isPlaying={true} />)
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument()
  })

  it('shows Play button when not playing', () => {
    render(<ShaderControls {...DEFAULT_PROPS} isPlaying={false} />)
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument()
  })

  it('calls onTogglePlay when play/pause button is clicked', async () => {
    const onTogglePlay = vi.fn()
    const user = userEvent.setup()
    render(<ShaderControls {...DEFAULT_PROPS} onTogglePlay={onTogglePlay} />)
    await user.click(screen.getByRole('button', { name: /pause/i }))
    expect(onTogglePlay).toHaveBeenCalledTimes(1)
  })

  it('calls onStartRecording when start recording button is clicked', async () => {
    const onStartRecording = vi.fn()
    const user = userEvent.setup()
    render(<ShaderControls {...DEFAULT_PROPS} onStartRecording={onStartRecording} />)
    await user.click(screen.getByRole('button', { name: /start recording/i }))
    expect(onStartRecording).toHaveBeenCalledTimes(1)
  })

  it('calls onStopRecording when stop recording button is clicked', async () => {
    const onStopRecording = vi.fn()
    const user = userEvent.setup()
    render(<ShaderControls {...DEFAULT_PROPS} isRecording={true} onStopRecording={onStopRecording} />)
    await user.click(screen.getByRole('button', { name: /stop recording/i }))
    expect(onStopRecording).toHaveBeenCalledTimes(1)
  })

  it('shows Mute button when not muted', () => {
    mockUseAppStorage.mockReturnValue({ ...DEFAULT_APP_STORAGE, muted: false })
    render(<ShaderControls {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument()
  })

  it('shows Unmute button when muted', () => {
    mockUseAppStorage.mockReturnValue({ ...DEFAULT_APP_STORAGE, muted: true })
    render(<ShaderControls {...DEFAULT_PROPS} />)
    expect(screen.getByRole('button', { name: /unmute/i })).toBeInTheDocument()
  })

  it('does not render immersive button when onToggleImmersive is not provided', () => {
    render(<ShaderControls {...DEFAULT_PROPS} />)
    expect(screen.queryByRole('button', { name: /immersive/i })).not.toBeInTheDocument()
  })

  it('renders immersive button when onToggleImmersive is provided', () => {
    render(<ShaderControls {...DEFAULT_PROPS} onToggleImmersive={vi.fn()} />)
    expect(screen.getByRole('button', { name: /immersive mode/i })).toBeInTheDocument()
  })
})
