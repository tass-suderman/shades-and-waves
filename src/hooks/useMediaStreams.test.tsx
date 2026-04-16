import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React from 'react'
import { useMediaStreams, MediaStreamsProvider } from './useMediaStreams'

// ---------------------------------------------------------------------------
// Mock helpers for MediaStream and mediaDevices
// ---------------------------------------------------------------------------

function makeMockTrack(kind: 'audio' | 'video'): MediaStreamTrack {
  return {
    kind,
    stop: vi.fn(),
    onended: null,
  } as unknown as MediaStreamTrack
}

function makeMockStream(tracks: MediaStreamTrack[] = []): MediaStream {
  return {
    getTracks: () => tracks,
    getVideoTracks: () => tracks.filter(t => t.kind === 'video'),
    getAudioTracks: () => tracks.filter(t => t.kind === 'audio'),
  } as unknown as MediaStream
}

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MediaStreamsProvider, null, children)

// ---------------------------------------------------------------------------

describe('useMediaStreams', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
        getDisplayMedia: vi.fn(),
      },
    })
    // MediaStream must be constructable with `new`
    vi.stubGlobal('MediaStream', class MockMediaStream {
      private tracks: MediaStreamTrack[]
      constructor(tracks?: MediaStreamTrack[]) {
        this.tracks = tracks ?? []
      }
      getTracks() { return this.tracks }
      getVideoTracks() { return this.tracks.filter(t => t.kind === 'video') }
      getAudioTracks() { return this.tracks.filter(t => t.kind === 'audio') }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('initialises with all streams disabled', () => {
    const { result } = renderHook(() => useMediaStreams(), { wrapper })
    expect(result.current.webcamEnabled).toBe(false)
    expect(result.current.micEnabled).toBe(false)
    expect(result.current.webcamStream).toBeNull()
    expect(result.current.audioStream).toBeNull()
  })

  describe('webcam', () => {
    it('enables webcam when toggled on', async () => {
      const videoTrack = makeMockTrack('video')
      const mockStream = makeMockStream([videoTrack])
      ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useMediaStreams(), { wrapper })
      await act(() => result.current.handleToggleWebcam())

      expect(result.current.webcamEnabled).toBe(true)
      expect(result.current.webcamStream).toBe(mockStream)
    })

    it('disables webcam and stops tracks when toggled off', async () => {
      const videoTrack = makeMockTrack('video')
      const mockStream = makeMockStream([videoTrack])
      ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useMediaStreams(), { wrapper })
      await act(() => result.current.handleToggleWebcam())
      await act(() => result.current.handleToggleWebcam())

      expect(result.current.webcamEnabled).toBe(false)
      expect(result.current.webcamStream).toBeNull()
      expect(videoTrack.stop).toHaveBeenCalled()
    })

    it('does not update state when getUserMedia fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Permission denied'))

      const { result } = renderHook(() => useMediaStreams(), { wrapper })
      await act(() => result.current.handleToggleWebcam())

      expect(result.current.webcamEnabled).toBe(false)
      expect(result.current.webcamStream).toBeNull()
      consoleError.mockRestore()
    })
  })

  describe('microphone', () => {
    it('enables microphone when toggled on', async () => {
      const audioTrack = makeMockTrack('audio')
      const mockStream = makeMockStream([audioTrack])
      ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useMediaStreams(), { wrapper })
      await act(() => result.current.handleToggleMic())

      expect(result.current.micEnabled).toBe(true)
      expect(result.current.audioStream).toBe(mockStream)
    })

    it('disables microphone and stops tracks when toggled off', async () => {
      const audioTrack = makeMockTrack('audio')
      const mockStream = makeMockStream([audioTrack])
      ;(navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValue(mockStream)

      const { result } = renderHook(() => useMediaStreams(), { wrapper })
      await act(() => result.current.handleToggleMic())
      await act(() => result.current.handleToggleMic())

      expect(result.current.micEnabled).toBe(false)
      expect(result.current.audioStream).toBeNull()
    })
  })
})
