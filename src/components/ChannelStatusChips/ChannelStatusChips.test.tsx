// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock hooks used internally by ChannelStatusChips
vi.mock('../../hooks/useMediaStreams', () => ({
  useMediaStreams: vi.fn(),
}))
vi.mock('../../hooks/useStrudelAnalyzer', () => ({
  useStrudelAnalyzer: vi.fn(),
}))

import { useMediaStreams } from '../../hooks/useMediaStreams'
import { useStrudelAnalyzer } from '../../hooks/useStrudelAnalyzer'
import ChannelStatusChips from './ChannelStatusChips'

const mockUseMediaStreams = useMediaStreams as ReturnType<typeof vi.fn>
const mockUseStrudelAnalyzer = useStrudelAnalyzer as ReturnType<typeof vi.fn>

function setup({ webcamEnabled = false, micEnabled = false, analyzer = null as AnalyserNode | null } = {}) {
  mockUseMediaStreams.mockReturnValue({ webcamEnabled, micEnabled })
  mockUseStrudelAnalyzer.mockReturnValue({ analyzer })
}

describe('ChannelStatusChips', () => {
  it('renders no chips when nothing is enabled', () => {
    setup()
    render(<ChannelStatusChips />)
    expect(screen.queryByText(/iChannel/i)).not.toBeInTheDocument()
  })

  it('renders webcam chip when webcam is enabled', () => {
    setup({ webcamEnabled: true })
    render(<ChannelStatusChips />)
    expect(screen.getByText('iChannel0: Webcam')).toBeInTheDocument()
  })

  it('renders mic chip when mic is enabled', () => {
    setup({ micEnabled: true })
    render(<ChannelStatusChips />)
    expect(screen.getByText('iChannel1: Mic')).toBeInTheDocument()
  })

  it('renders strudel chip when analyzer is available', () => {
    setup({ analyzer: {} as unknown as AnalyserNode })
    render(<ChannelStatusChips />)
    expect(screen.getByText('iChannel2: Strudel')).toBeInTheDocument()
  })

  it('renders all chips when all are active', () => {
    setup({ webcamEnabled: true, micEnabled: true, analyzer: {} as unknown as AnalyserNode })
    render(<ChannelStatusChips />)
    expect(screen.getByText('iChannel0: Webcam')).toBeInTheDocument()
    expect(screen.getByText('iChannel1: Mic')).toBeInTheDocument()
    expect(screen.getByText('iChannel2: Strudel')).toBeInTheDocument()
  })
})
