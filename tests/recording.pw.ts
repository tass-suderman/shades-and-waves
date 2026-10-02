import { test, expect } from '@playwright/test'
import { execFileSync, spawnSync } from 'node:child_process'

test('recording contains uploaded audio', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Media & uniforms' }).click()
  await page.getByLabel('Upload audio').setInputFiles('tests/fixtures/bass.wav')
  await expect(page.getByRole('button', { name: 'Pause Audio' })).toBeVisible()
  await page.getByRole('button', { name: 'Start recording' }).click()
  await page.waitForTimeout(2200)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Stop recording' }).click()
  const download = await downloadPromise
  const path = await download.path()
  if (!path) throw new Error('Recording did not save')
  const codec = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name', '-of', 'csv=p=0', path], { encoding: 'utf8' }).trim()
  expect(codec).not.toBe('')
  const levels = spawnSync('ffmpeg', ['-hide_banner', '-i', path, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' })
  expect(levels.status).toBe(0)
  const meanVolume = levels.stderr.match(/mean_volume:\s*(-?[\d.]+) dB/)
  expect(meanVolume).not.toBeNull()
  expect(Number(meanVolume?.[1])).toBeGreaterThan(-50)
})
