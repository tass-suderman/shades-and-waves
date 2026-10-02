import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

const shader = readFileSync('public/examples/glsl/audio-reactive-video.glsl', 'utf8')

test('uploaded media loops, feeds shader textures, pauses, replaces and cleans up', async ({ page }) => {
  const shaderErrors: string[] = []
  page.on('console', message => {
    if (/Shader error|GL_INVALID|GL_INVALID_OPERATION/.test(message.text())) shaderErrors.push(message.text())
  })
  page.on('pageerror', error => shaderErrors.push(error.message))
  await page.addInitScript(source => {
    localStorage.setItem('shader-playground:glsl-code', source)
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style'); style.textContent = 'canvas { width: 160px !important; height: 120px !important; }'; document.head.append(style)
    })
    // Observe actual media and GPU output without replacing their behavior.
    const state = { media: [] as HTMLMediaElement[], revoked: [] as string[], pixels: [] as number[], flags: {} as Record<string, number>, fftPeak: 0 }
    Object.assign(window, { mediaTest: state })
    const create = document.createElement.bind(document)
    document.createElement = ((tag: string, options?: ElementCreationOptions) => {
      const element = create(tag, options)
      if (element instanceof HTMLMediaElement) state.media.push(element)
      return element
    }) as typeof document.createElement
    const revoke = URL.revokeObjectURL.bind(URL)
    URL.revokeObjectURL = url => { state.revoked.push(url); revoke(url) }
    const draw = WebGLRenderingContext.prototype.drawArrays
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      draw.apply(this, args)
      const pixels = new Uint8Array(4)
      this.readPixels(this.drawingBufferWidth / 2, this.drawingBufferHeight / 2, 1, 1, this.RGBA, this.UNSIGNED_BYTE, pixels)
      state.pixels = Array.from(pixels)
      const program = this.getParameter(this.CURRENT_PROGRAM)
      if (program) for (const channel of [0, 1, 3, 4]) {
        const location = this.getUniformLocation(program, `iChannel${channel}Enabled`)
        state.flags[channel] = Number(this.getUniform(program, location))
      }
    }
    const fft = AnalyserNode.prototype.getByteFrequencyData
    AnalyserNode.prototype.getByteFrequencyData = function (data) {
      fft.call(this, data)
      state.fftPeak = Math.max(...data)
    }
  }, shader)
  await page.goto('/')
  await page.getByRole('button', { name: 'Media & uniforms', exact: true }).click()
  await page.getByLabel('Upload video', { exact: true }).setInputFiles('tests/fixtures/video.webm')
  await expect(page.getByRole('button', { name: 'Pause Video', exact: true })).toBeVisible()
  await page.getByLabel('Upload audio', { exact: true }).setInputFiles('tests/fixtures/bass.wav')
  await expect(page.getByRole('button', { name: 'Pause Audio', exact: true })).toBeVisible()
  const state = () => page.evaluate(() => {
    const s = (window as unknown as { mediaTest: { media: HTMLMediaElement[]; flags: Record<string, number>; pixels: number[]; fftPeak: number; revoked: string[] } }).mediaTest
    return { ...s, media: s.media.map(m => ({ ready: m.readyState, seeking: m.seeking, time: m.currentTime, paused: m.paused, loop: m.loop, src: m.getAttribute('src'), ended: m.ended })) }
  })
  await expect.poll(async () => (await state()).flags[3], { timeout: 15000 }).toBe(1)
  await expect.poll(async () => (await state()).flags[4]).toBe(1)
  await expect.poll(async () => (await state()).fftPeak).toBeGreaterThan(0)
  await expect.poll(async () => (await state()).pixels.slice(0, 3).some(v => v > 10)).toBe(true)
  // Both one-second fixtures must wrap around and keep playing past their duration.
  await page.waitForTimeout(2300)
  for (const media of (await state()).media.filter(m => m.src)) {
    expect(media.loop).toBe(true)
    expect(media.ended).toBe(false)
    expect(media.paused).toBe(false)
    expect(media.time).toBeLessThan(1.1)
  }
  await page.getByRole('button', { name: 'Pause Audio', exact: true }).click()
  await expect.poll(async () => (await state()).flags[4]).toBe(0)
  await page.getByRole('button', { name: 'Play Audio', exact: true }).click()
  await expect.poll(async () => (await state()).flags[4]).toBe(1)
  await page.getByRole('button', { name: 'Pause Video', exact: true }).click()
  await page.evaluate(() => {
    const media = (window as unknown as { mediaTest: { media: HTMLMediaElement[] } }).mediaTest.media[0]
    media.currentTime = 0.7
  })
  const pausedTime = (await state()).media[0].time
  await page.waitForTimeout(250)
  expect((await state()).media[0].time).toBe(pausedTime)
  expect((await state()).flags[3]).toBe(1)
  await page.getByRole('button', { name: 'Restart Video', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Pause Video', exact: true })).toBeVisible()
  expect((await state()).media[0].time).toBeLessThan(0.5)
  await page.getByRole('button', { name: 'Enable Webcam (iChannel0)', exact: true }).click()
  await page.getByRole('button', { name: 'Enable Microphone (iChannel1)', exact: true }).click()
  await expect.poll(async () => (await state()).flags[0]).toBe(1)
  await expect.poll(async () => (await state()).flags[1]).toBe(1)
  await page.getByLabel('Upload video', { exact: true }).setInputFiles('tests/fixtures/video.webm')
  await expect.poll(async () => (await state()).revoked.length).toBe(1)
  await page.getByRole('button', { name: 'Remove Video', exact: true }).click()
  await page.getByRole('button', { name: 'Remove Audio', exact: true }).click()
  await expect.poll(async () => (await state()).flags[3]).toBe(0)
  await expect.poll(async () => (await state()).flags[4]).toBe(0)
  expect((await state()).revoked).toHaveLength(3)
  expect(shaderErrors).toEqual([])
  await page.getByLabel('Upload video', { exact: true }).setInputFiles({ name: 'bad.webm', mimeType: 'video/webm', buffer: Buffer.from('invalid video') })
  await expect(page.getByRole('alert')).toContainText(/Playback failed|Unable to decode/)
  await page.getByRole('button', { name: 'Remove Video', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
})
