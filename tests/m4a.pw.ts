import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

for (const forceWebAudioFailure of [false, true]) {
  test(`AAC M4A falls back through ${forceWebAudioFailure ? 'local converter' : 'Web Audio'} when media playback is unsupported`, async ({ page }) => {
    const errors: string[] = []
    const coreRequests: string[] = []
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => {
      if (request.url().includes('ffmpeg-core.wasm')) coreRequests.push(request.url())
    })
    await page.addInitScript(forceDecodeFailure => {
      const nativeCreate = URL.createObjectURL.bind(URL)
      const unsupported = new Set<string>()
      Object.assign(window, { unsupportedM4a: unsupported })
      const createElement = document.createElement.bind(document)
      document.createElement = ((tag: string, options?: ElementCreationOptions) => {
        const element = createElement(tag, options)
        if (element instanceof HTMLAudioElement) Object.assign(window, { testAudio: element })
        return element
      }) as typeof document.createElement
      URL.createObjectURL = blob => {
        const url = nativeCreate(blob)
        if (blob.type === 'audio/mp4') unsupported.add(url)
        return url
      }
      const nativePlay = HTMLMediaElement.prototype.play
      HTMLMediaElement.prototype.play = function () {
        if (unsupported.has(this.src)) return Promise.reject(new DOMException('AAC unavailable', 'NotSupportedError'))
        return nativePlay.call(this)
      }
      if (forceDecodeFailure) {
        BaseAudioContext.prototype.decodeAudioData = () => Promise.reject(new DOMException('AAC unavailable', 'EncodingError'))
      }
    }, forceWebAudioFailure)

    await page.goto('/')
    await page.getByRole('button', { name: 'Media & uniforms' }).click()
    await expect(page.getByLabel('Upload audio')).toBeAttached()
    const path = process.env.TEST_M4A_FILE ?? 'tests/fixtures/bass.m4a'
    await page.getByLabel('Upload audio').setInputFiles({
      name: 'sadbean_geh.m4a',
      mimeType: 'audio/mp4',
      buffer: readFileSync(path),
    })
    await expect(page.getByRole('button', { name: 'Pause Audio' })).toBeVisible({ timeout: 30000 })
    const result = await page.evaluate(() => {
      const { testAudio: audio, unsupportedM4a: unsupported } = window as unknown as { testAudio: HTMLAudioElement; unsupportedM4a: Set<string> }
      return { src: audio?.src ?? '', unsupported: unsupported.has(audio?.src ?? ''), paused: audio?.paused }
    })
    expect(result.unsupported).toBe(false)
    expect(result.paused).toBe(false)
    if (!forceWebAudioFailure) expect(coreRequests).toHaveLength(0)
    await expect(page.getByRole('alert')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
