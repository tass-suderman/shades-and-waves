# shades-and-waves

A browser-based creative coding playground that combines real-time GLSL fragment shader editing with live music coding via [Strudel](https://strudel.cc). Write shaders that react to audio, or compose music that drives visuals — all in one tab.

🌐 **Live site:** [shades-n-waves.tass.suderman.pro](https://shades-n-waves.tass.suderman.pro)

---

## Features

- **GLSL editor** — write fragment shaders powered by WebGL. Hot-reloads on `Ctrl+Enter`.
- **Strudel editor** — live-code music patterns using the Strudel mini-notation. Play with `Alt+Enter`, stop with `Alt+.`.
- **Audio-reactive shaders** — shader uniforms (`iChannel0`–`iChannel2`) receive webcam video, microphone FFT, and Strudel audio FFT so visuals react to sound.
- **Webcam & mic input** — optionally pipe camera or microphone data into your shader as `iChannel0`/`iChannel1`.
- **Immersive mode** — the shader fills the full viewport with the editor as a transparent overlay; adjust background opacity with the slider.
- **Import / export** — save and load shaders (`.glsl`) or Strudel patterns (`.strudel`).
- **Vim keybindings** — toggle in Settings.
- **Examples** — curated starting points for both GLSL and Strudel.
- **Recording** — capture the shader canvas (with audio) as an MP4 or WebM video.

---

## How to use

1. Open the site at [shades-n-waves.tass.suderman.pro](https://shades-n-waves.tass.suderman.pro).
2. Use the tab bar to switch between **GLSL**, **Strudel**, **Examples**, **Settings**, and **About**.
3. **GLSL tab** — edit the fragment shader in the left pane; press `Ctrl+Enter` (or the *Run Shader* button) to compile and run it.
4. **Strudel tab** — write a music pattern; press `Alt+Enter` (or *Play Strudel*) to start. The shader receives audio data in real time via `iChannel2`.
5. **Examples** — browse and load example shaders and patterns with a single click.
6. **Settings** — toggle Vim keybindings and adjust font size.
7. The 🎵 icon in the Strudel header opens the *Available Sounds* panel, which lists all built-in oscillators, synths, and noise types.
8. The ℹ icon in the GLSL header opens the *Available Uniforms* panel.

---

## GLSL uniforms

| Uniform | Type | Description |
|---|---|---|
| `iTime` | `float` | Elapsed time in seconds |
| `iResolution` | `vec2` | Canvas size in pixels |
| `iMouse` | `vec4` | Mouse position (xy) and last click (zw) |
| `iFrame` | `int` | Frame counter |
| `iChannel0` | `sampler2D` | Webcam video feed |
| `iChannel1` | `sampler2D` | Microphone / system audio FFT |
| `iChannel2` | `sampler2D` | Strudel audio FFT |
| `iChannel0Enabled` | `bool` | Whether webcam is active |
| `iChannel1Enabled` | `bool` | Whether mic/system audio is active |
| `iChannel2Enabled` | `bool` | Whether Strudel audio is active |

These uniforms are compatible with ShaderToy shaders.

---

## Local setup

**Prerequisites:** [Node.js](https://nodejs.org) ≥ 18 and [pnpm](https://pnpm.io) (or npm).

```bash
# 1. Clone the repository
git clone https://github.com/tass-suderman/shades-and-waves.git
cd shades-and-waves

# 2. Install dependencies
pnpm install        # or: npm install

# 3. Start the dev server
pnpm dev            # or: npm run dev
# → open http://localhost:5173

# 4. Build for production
pnpm build          # or: npm run build

# 5. Run tests
pnpm test           # or: npm test
```

---

## Technologies

| Layer | Technology |
|---|---|
| UI framework | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Component library | [MUI (Material UI) v6](https://mui.com) |
| GLSL editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react` |
| Strudel editor & runtime | [@strudel/codemirror](https://www.npmjs.com/package/@strudel/codemirror), [@strudel/webaudio](https://www.npmjs.com/package/@strudel/webaudio) |
| Graphics | WebGL (via a `<canvas>` managed directly) |
| Build tool | [Vite](https://vitejs.dev) |
| Testing | [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) |

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` / `Cmd+Enter` | Compile & run shader |
| `Ctrl+.` / `Cmd+.` | Pause / resume shader |
| `Alt+Enter` | Play Strudel pattern |
| `Alt+.` | Stop Strudel pattern |

---

## License

[GNU Affero General Public License v3.0](LICENSE.md)

### Uploaded video and audio

Open **Media & uniforms** in the GLSL toolbar to upload local media. Video
(`iChannel3`) plays muted and loops; audio (`iChannel4`) plays audibly and loops.
Each has Play/Pause, Restart, and Remove controls. Files remain local, last only for the
current browser session, and are not saved with shader code. Shader pause freezes
rendering; pause the media separately to stop playback. Use browser-supported
formats such as WebM/MP4 video and WAV/MP3 audio. If an uploaded M4A cannot play
as a media element, the app first tries the browser Web Audio decoder (the
same API Strudel uses), then converts the decoded result to WAV locally. If that
also fails, a bundled converter runs in the browser. The latter downloads a
roughly 31 MB decoder on first use and may take a moment for longer files.
Recordings mix uploaded audio with active microphone and Strudel audio.

Load **Audio Reactive Video** from Saved → Examples. It averages webcam and
uploaded video when both are enabled, and averages active microphone, Strudel,
and uploaded-audio frequency data. Edit the constants at the top of
`public/examples/glsl/audio-reactive-video.glsl` to adjust uploaded-video zoom and
pan, bass weighting and frequency range, audio gain, bloom, vignette, and shake.
No video input produces black; no audio input displays the video without effects.
The uploaded video preserves its aspect ratio with a centered cover crop.

The uniform reference documents channel availability, video dimensions, and
audio sample rates. Audio textures run from DC to Nyquist along X, with amplitude
in the red component. Paused video retains its texture; paused uploaded audio is
disabled in the shader.

Run `npm run test:e2e` for the Playwright media integration test after installing
Chromium with `npx playwright install chromium`. The tiny test fixtures contain
a generated test pattern and a 100 Hz tone; no external media is needed.

To use another installed Chromium executable for testing, set
`PLAYWRIGHT_EXECUTABLE_PATH=/path/to/browser npm run test:e2e`. The test uses a
small canvas so software rendering can keep up with real-time media playback.
