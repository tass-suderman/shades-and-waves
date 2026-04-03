import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, act } from '@testing-library/react'
import React, { forwardRef, useImperativeHandle } from 'react'

// ---------------------------------------------------------------------------
// Mocks – all heavy components replaced with thin stubs
// ---------------------------------------------------------------------------

const { mockShaderPane, mockEditorPane, mockToggle } = vi.hoisted(() => ({
  mockShaderPane: vi.fn(),
  mockEditorPane: vi.fn(),
  mockToggle: vi.fn(),
}))

vi.mock('./components/ShaderPane', () => ({
  default: (props: { shaderSource: string }) => {
    mockShaderPane(props)
    return <div data-testid="shader-pane" data-source={props.shaderSource} />
  },
}))

vi.mock('./components/EditorPane', () => ({
  default: (props: { pendingSource: string; onCodeChange: (c: string) => void }) => {
    mockEditorPane(props)
    return <div data-testid="editor-pane" />
  },
}))

vi.mock('./components/StrudelPane', () => ({
  default: forwardRef((_props: unknown, ref: React.Ref<{ toggle: () => void }>) => {
    useImperativeHandle(ref, () => ({ toggle: mockToggle }), [])
    return <div data-testid="strudel-pane" />
  }),
}))

// ShaderPane component uses WebGL canvas – stub it out
vi.mock('./components/ShaderPane', () => ({
  default: (props: { shaderSource: string }) => {
    mockShaderPane(props)
    return <div data-testid="shader-pane" data-source={props.shaderSource} />
  },
}))

// ---------------------------------------------------------------------------
// Component under test (imported after mocks)
// ---------------------------------------------------------------------------
import App from './App'
import { DEFAULT_SHADER } from './shaders/default'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('App – global keyboard shortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Ctrl+Enter prevents the default browser action', () => {
    render(<App />)
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    })
    act(() => window.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true)
  })

  it('Ctrl+Enter runs the shader (passes pendingSource to ShaderPane)', () => {
    render(<App />)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true, cancelable: true }),
      )
    })
    // ShaderPane should receive the current pendingSource (which starts as DEFAULT_SHADER)
    const latestCall = mockShaderPane.mock.calls.at(-1)?.[0]
    expect(latestCall?.shaderSource).toBe(DEFAULT_SHADER)
  })

  it('Alt+Enter prevents the default browser action', () => {
    render(<App />)
    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      altKey: true,
      bubbles: true,
      cancelable: true,
    })
    act(() => window.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(true)
  })

  it('Alt+Enter calls toggle() on the StrudelPane', () => {
    render(<App />)
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', altKey: true, bubbles: true, cancelable: true }),
      )
    })
    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('other keys do not prevent default', () => {
    render(<App />)
    const event = new KeyboardEvent('keydown', {
      key: 'a',
      bubbles: true,
      cancelable: true,
    })
    act(() => window.dispatchEvent(event))
    expect(event.defaultPrevented).toBe(false)
  })
})
