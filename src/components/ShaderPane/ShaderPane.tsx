import { forwardRef, useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react'
import Box from '@mui/material/Box'
import { useWebGL } from '../../hooks/useWebGL'
import { useStrudelAnalyzer } from '../../hooks/useStrudelAnalyzer'
import { useStrudelAudioStream } from '../../hooks/useStrudelAudioStream'
import { useMediaStreams } from '../../hooks/useMediaStreams'
import { downloadBlob } from '../../utility/download'

export interface ShaderPaneHandle {
  pause: () => void
  unpause: () => void
  togglePlay: () => void
  startRecording: () => void
  stopRecording: () => void
  toggleFullscreen: () => void
}

interface ShaderPaneProps {
  shaderSource: string
  onShaderError?: (error: string | null) => void
  onPlayStateChange?: (playing: boolean) => void
  onRecordingStateChange?: (recording: boolean) => void
  onFullscreenStateChange?: (fullscreen: boolean) => void
}

export default forwardRef<ShaderPaneHandle, ShaderPaneProps>(function ShaderPane({
  shaderSource,
  onShaderError,
  onPlayStateChange,
  onRecordingStateChange,
  onFullscreenStateChange,
}: ShaderPaneProps, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const recordingAudioContextRef = useRef<AudioContext | null>(null)
  const recordingAudioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null)
  const recordingAudioSourcesRef = useRef<MediaStreamAudioSourceNode[]>([])
  const { analyzer } = useStrudelAnalyzer()
  const { strudelAudioStream } = useStrudelAudioStream()
  const { webcamStream, audioStream, uploadedVideo, uploadedAudio } = useMediaStreams()
  const uploadedAudioRecordingStream = uploadedAudio.recordingStream

  useWebGL(canvasRef, {
    shaderSource,
    uploadedVideo: uploadedVideo.element as HTMLVideoElement | null,
    uploadedAudioAnalyser: uploadedAudio.playing ? uploadedAudio.analyser : null,
    webcamStream,
    audioStream,
    isPlaying,
    strudelAnalyser: analyzer,
    onError: onShaderError,
  })

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const handleStartRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof canvas.captureStream !== 'function') return

    const canvasStream = canvas.captureStream(30)
    const audioContext = new AudioContext()
    const destination = audioContext.createMediaStreamDestination()
    recordingAudioContextRef.current = audioContext
    recordingAudioDestinationRef.current = destination
    void audioContext.resume()

    const recordStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...destination.stream.getAudioTracks(),
    ])

    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm'

    const recorder = new MediaRecorder(recordStream, { mimeType })

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunksRef.current.push(e.data)
      }
    }

    recorder.onstop = async () => {
      recordingAudioSourcesRef.current.forEach(source => source.disconnect())
      recordingAudioSourcesRef.current = []
      recordingAudioDestinationRef.current = null
      recordingAudioContextRef.current = null
      void audioContext.close()
      const chunks = recordedChunksRef.current.splice(0)
      if (chunks.length === 0) return
      const blob = new Blob(chunks, { type: recorder.mimeType || mimeType })
      const ext = (recorder.mimeType || mimeType).includes('mp4') ? 'mp4' : 'webm'
      const filename = `recording.${ext}`

      // showSaveFilePicker is part of the File System Access API and not yet
      // in TypeScript's lib.dom.d.ts – cast through unknown to avoid using any.
      type ShowSaveFilePicker = (options: {
        suggestedName?: string
        types?: { description: string; accept: Record<string, string[]> }[]
      }) => Promise<{ createWritable: () => Promise<{ write: (data: Blob) => Promise<void>; close: () => Promise<void> }> }>
      const winFSA = window as Window & { showSaveFilePicker?: ShowSaveFilePicker }

      if (typeof winFSA.showSaveFilePicker === 'function') {
        try {
          const handle = await winFSA.showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'Video file', accept: { [(recorder.mimeType || mimeType)]: [`.${ext}`] } }],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) {
          // AbortError means user cancelled – do nothing; anything else falls through to anchor download
          if ((err as DOMException).name === 'AbortError') return
        }
      }

      downloadBlob(blob, filename)
    }

    recordedChunksRef.current = []
    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }, [])

  // Keep the recorder's single audio track mixed from every active source.
  // A stream uploaded after recording starts is connected on the next render.
  useEffect(() => {
    if (!isRecording) return
    const destination = recordingAudioDestinationRef.current
    const context = recordingAudioContextRef.current
    if (!destination || !context) return
    recordingAudioSourcesRef.current.forEach(source => source.disconnect())
    recordingAudioSourcesRef.current = [audioStream, strudelAudioStream, uploadedAudioRecordingStream]
      .filter((stream): stream is MediaStream => !!stream && stream.getAudioTracks().length > 0)
      .map(stream => {
        const source = context.createMediaStreamSource(stream)
        source.connect(destination)
        return source
      })
  }, [isRecording, audioStream, strudelAudioStream, uploadedAudioRecordingStream])

  const handleStopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    setIsRecording(false)
  }, [])

  // Expose imperative controls to parent (after handlers are defined)
  useImperativeHandle(ref, () => ({
    pause() { setIsPlaying(false) },
    unpause() { setIsPlaying(true) },
    togglePlay() { setIsPlaying(p => !p) },
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    toggleFullscreen: handleFullscreen,
  }), [handleStartRecording, handleStopRecording, handleFullscreen])

  // Notify parent of state changes (used when controls are lifted outside the pane)
  useEffect(() => { onPlayStateChange?.(isPlaying) }, [isPlaying, onPlayStateChange])
  useEffect(() => { onRecordingStateChange?.(isRecording) }, [isRecording, onRecordingStateChange])
  useEffect(() => { onFullscreenStateChange?.(isFullscreen) }, [isFullscreen, onFullscreenStateChange])

  // Stop any active recording when the component unmounts
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#000',
        position: 'relative',
      }}
    >
      {/* Canvas fills pane */}
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Box>
    </Box>
  )
})
