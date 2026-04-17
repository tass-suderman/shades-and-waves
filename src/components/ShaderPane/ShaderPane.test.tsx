import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import ShaderPane from './ShaderPane'

// Mock useWebGL to avoid real WebGL calls in jsdom
vi.mock('../../hooks/useWebGL', () => ({
  useWebGL: vi.fn(),
}))

// Mock useStrudelAnalyzer, useStrudelAudioStream, useMediaStreams using
// importOriginal so that the Provider exports are preserved for test-utils
vi.mock('../../hooks/useStrudelAnalyzer', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks/useStrudelAnalyzer')>()
  return {
    ...actual,
    useStrudelAnalyzer: () => ({ analyzer: null }),
  }
})
vi.mock('../../hooks/useStrudelAudioStream', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks/useStrudelAudioStream')>()
  return {
    ...actual,
    useStrudelAudioStream: () => ({ strudelAudioStream: null }),
  }
})
vi.mock('../../hooks/useMediaStreams', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks/useMediaStreams')>()
  return {
    ...actual,
    useMediaStreams: () => ({ webcamStream: null, audioStream: null }),
  }
})

describe('ShaderPane', () => {
  it('renders the canvas element', () => {
    renderWithProviders(
      <ShaderPane shaderSource="void main() { gl_FragColor = vec4(1.0); }" />
    )
    expect(document.querySelector('canvas')).toBeInTheDocument()
  })

  it('renders shader controls by default', () => {
    renderWithProviders(
      <ShaderPane shaderSource="void main() {}" />
    )
    // ShaderControls renders the mute button when controls are shown
    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument()
  })

  it('does not render shader controls when hideControls is true', () => {
    renderWithProviders(
      <ShaderPane shaderSource="void main() {}" hideControls />
    )
    expect(screen.queryByRole('button', { name: /mute/i })).toBeNull()
  })

  it('calls onPlayStateChange with initial playing state on mount', () => {
    const onPlayStateChange = vi.fn()
    renderWithProviders(
      <ShaderPane shaderSource="void main() {}" onPlayStateChange={onPlayStateChange} />
    )
    expect(onPlayStateChange).toHaveBeenCalledWith(true)
  })
})
