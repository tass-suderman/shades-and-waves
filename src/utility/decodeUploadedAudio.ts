/** Convert an AAC/MP4 audio upload to browser-native PCM only when playback fails. */
export async function decodeUploadedAudio(file: File): Promise<Blob> {
  // ffmpeg and its core are loaded only for files that the browser cannot decode.
  const [{ FFmpeg }, { default: coreURL }, { default: wasmURL }, { default: classWorkerURL }] = await Promise.all([
    import('@ffmpeg/ffmpeg'),
    import('@ffmpeg/core?url'),
    import('@ffmpeg/core/wasm?url'),
    import('@ffmpeg/ffmpeg/worker?worker&url'),
  ])
  const ffmpeg = new FFmpeg()
  try {
    await ffmpeg.load({ coreURL, wasmURL, classWorkerURL })
    await ffmpeg.writeFile('input.m4a', new Uint8Array(await file.arrayBuffer()))
    const exitCode = await ffmpeg.exec(['-i', 'input.m4a', '-vn', '-c:a', 'pcm_s16le', '-f', 'wav', 'output.wav'])
    if (exitCode !== 0) throw new Error('Audio conversion failed')
    const data = await ffmpeg.readFile('output.wav')
    if (typeof data === 'string' || data.length === 0) throw new Error('Audio conversion returned no data')
    return new Blob([new Uint8Array(data)], { type: 'audio/wav' })
  } finally {
    ffmpeg.terminate()
  }
}
