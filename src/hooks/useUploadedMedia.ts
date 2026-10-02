import { useEffect, useRef, useState } from 'react'

export function useUploadedMedia(kind: 'video' | 'audio') {
  const [element, setElement] = useState<HTMLVideoElement | HTMLAudioElement | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
  const [converting, setConverting] = useState(false)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const resource = useRef<{ element: HTMLMediaElement; url: string; file: File; context?: AudioContext; converting?: boolean; converted?: boolean } | null>(null)

  function dispose() {
    const current = resource.current
    resource.current = null
    if (!current) return
    current.element.onplaying = current.element.onpause = current.element.onerror = null
    current.element.pause()
    current.element.removeAttribute('src')
    current.element.load()
    URL.revokeObjectURL(current.url)
    void current.context?.close()
  }

  useEffect(() => () => dispose(), [])

  function clear() {
    dispose()
    setElement(null)
    setAnalyser(null)
    setRecordingStream(null)
    setName('')
    setPlaying(false)
    setConverting(false)
    setError('')
  }

  async function recoverM4a(current: NonNullable<typeof resource.current>) {
    if (kind !== 'audio' || current.converting || current.converted || !/\.m4a$/i.test(current.file.name)) return false
    current.converting = true
    setConverting(true)
    setError('')
    try {
      let wav: Blob
      try {
        if (!current.context) throw new Error('Web Audio is unavailable')
        const decoded = await current.context.decodeAudioData(await current.file.arrayBuffer())
        const { audioBufferToWav } = await import('../utility/audioBufferToWav')
        wav = audioBufferToWav(decoded)
      } catch {
        // Some browsers cannot decode AAC through either native audio API.
        const { decodeUploadedAudio } = await import('../utility/decodeUploadedAudio')
        wav = await decodeUploadedAudio(current.file)
      }
      if (resource.current !== current) return true
      const wavUrl = URL.createObjectURL(wav)
      current.element.src = wavUrl
      URL.revokeObjectURL(current.url)
      current.url = wavUrl
      current.converted = true
      await current.context?.resume()
      await current.element.play()
      if (resource.current === current) setError('')
    } catch (cause) {
      if (resource.current === current) {
        console.error('Failed to convert uploaded audio:', cause)
        setError('This M4A could not be converted for playback.')
      }
    } finally {
      current.converting = false
      if (resource.current === current) setConverting(false)
    }
    return true
  }

  async function play() {
    const current = resource.current
    if (!current) return
    try {
      await current.context?.resume()
      await current.element.play()
      if (resource.current === current) setError('')
    } catch (cause) {
      const unsupported = (cause instanceof DOMException && cause.name === 'NotSupportedError') ||
        current.element.error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
      if (resource.current === current && (current.converting || (unsupported && await recoverM4a(current)))) return
      if (resource.current === current) {
        setPlaying(false)
        setError('Playback failed. Try Play or choose a browser-supported file.')
      }
    }
  }

  function upload(file: File) {
    clear()
    const media = document.createElement(kind)
    const url = URL.createObjectURL(file)
    resource.current = { element: media, url, file }
    media.loop = true
    if (media instanceof HTMLVideoElement) {
      media.muted = true
      media.playsInline = true
    }
    media.onplaying = () => setPlaying(true)
    media.onpause = () => setPlaying(false)
    media.onerror = () => {
      if (resource.current?.element !== media) return
      if (kind === 'audio' && !resource.current.converted && /\.m4a$/i.test(file.name)) {
        void recoverM4a(resource.current)
        return
      }
      if (resource.current.converting) return
      setPlaying(false)
      setError('Unable to decode this file. Choose a browser-supported format.')
    }
    media.src = url
    if (kind === 'audio') {
      try {
        const context = new AudioContext()
        resource.current.context = context
        const fft = context.createAnalyser()
        fft.fftSize = 2048
        fft.smoothingTimeConstant = 0.8
        context.createMediaElementSource(media).connect(fft)
        fft.connect(context.destination)
        const recordingDestination = context.createMediaStreamDestination()
        fft.connect(recordingDestination)
        setAnalyser(fft)
        setRecordingStream(recordingDestination.stream)
      } catch {
        setError('Audio analysis is unavailable in this browser.')
      }
    }
    setElement(media)
    setName(file.name)
    void play()
  }

  function restart() {
    if (!element) return
    element.currentTime = 0
    void play()
  }

  return { element, name, error, playing, converting, analyser, recordingStream, upload, clear, play, restart, pause: () => element?.pause() }
}
