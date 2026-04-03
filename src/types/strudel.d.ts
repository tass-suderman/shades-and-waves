declare module '@strudel/codemirror' {
  export interface StrudelMirrorOptions {
    root: HTMLElement
    initialCode?: string
    prebake: () => Promise<void>
    defaultOutput: unknown
    getTime: () => number
    transpiler: unknown
    solo?: boolean
    onToggle?: (started: boolean) => void
  }
  export class StrudelMirror {
    constructor(options: StrudelMirrorOptions)
    /** Current code string – updated on every keystroke */
    code: string
    /** Underlying CodeMirror EditorView */
    editor: {
      state: { doc: { toString(): string; length: number } }
      dispatch(tr: { changes?: { from: number; to?: number; insert?: string } }): void
    }
    evaluate(): Promise<void>
    stop(): Promise<void>
    /** Replace the full editor content with the given string */
    setCode(code: string): void
  }
  export const codemirrorSettings: { get: () => Record<string, unknown> }
}

declare module '@strudel/repl' {
  export function prebake(): Promise<void>
}

declare module '@strudel/transpiler' {
  const transpiler: unknown
  export { transpiler }
}

declare module '@strudel/webaudio' {
  export const webaudioOutput: unknown
  export function getAudioContext(): AudioContext
  export function initAudioOnFirstClick(): void
  export function getSuperdoughAudioController(): {
    output: { destinationGain: GainNode }
  } | null
}
