// Neon Radial Spectrum
// Dual-ring FFT visualizer driven by iChannel1 (mic/system) or iChannel2 (Strudel).
// When no audio is enabled an animated demo waveform plays automatically.
//
// Controls
//   iChannel1 - microphone / system-audio frequency texture
//   iChannel2 - Strudel live-coding audio frequency texture
//   iChannel0 - webcam (blended into the background if enabled)

precision highp float;

uniform vec2  iResolution;
uniform float iTime;
uniform vec4  iMouse;
uniform int   iFrame;
uniform sampler2D iChannel0; uniform bool iChannel0Enabled;
uniform sampler2D iChannel1; uniform bool iChannel1Enabled;
uniform sampler2D iChannel2; uniform bool iChannel2Enabled;

#define TAU 6.28318530718

// Sample the frequency texture.  Falls back to an animated sine when no
// audio source is active so the shader always looks alive as a demo.
float audio(float x) {
    float v = 0.0;
    if (iChannel1Enabled) v = max(v, texture2D(iChannel1, vec2(x, 0.5)).r);
    if (iChannel2Enabled) v = max(v, texture2D(iChannel2, vec2(x, 0.5)).r);
    if (!iChannel1Enabled && !iChannel2Enabled) {
        // Synthesise a fake spectrum so the demo looks good without audio
        v  = 0.30 + 0.22 * sin(x * TAU * 3.0 + iTime * 2.1);
        v += 0.14 * sin(x * TAU * 7.0 - iTime * 1.5);
        v += 0.08 * sin(x * TAU * 13.0 + iTime * 0.8);
        v  = clamp(v, 0.0, 1.0);
    }
    return v;
}

// Average of the lowest few bins – used as a "beat" / bass driver
float bass() {
    float b = 0.0;
    for (int i = 0; i < 8; i++) b += audio(float(i) * 0.012);
    return b / 8.0;
}

// Vivid palette that cycles cleanly around the hue wheel
vec3 palette(float t) {
    return 0.5 + 0.5 * cos(TAU * (t + vec3(0.0, 0.333, 0.667)));
}

void main() {
    // Centre UV, normalised so the circle is always round
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy)
              / min(iResolution.x, iResolution.y);

    float b     = bass();
    float r     = length(uv);
    float angle = atan(uv.y, uv.x);   // -PI .. PI
    float t     = angle / TAU + 0.5;  // 0 .. 1  (position around the ring)

    // ------------------------------------------------------------------
    // Background
    // ------------------------------------------------------------------
    vec3 col = vec3(0.03, 0.02, 0.06);

    // Subtle radial colour bleed that pulses with the beat
    float glow = b * 0.20 * max(0.0, 0.72 - r);
    col += palette(iTime * 0.04) * glow;

    // Optional webcam layer
    if (iChannel0Enabled) {
        vec2 camUV = uv * 0.5 + 0.5;
        camUV.y   = 1.0 - camUV.y;
        vec4 cam  = texture2D(iChannel0, clamp(camUV, 0.0, 1.0));
        col = mix(col, cam.rgb * 0.45, 0.55);
    }

    // ------------------------------------------------------------------
    // Outer ring – full-spectrum bars radiating outward
    // ------------------------------------------------------------------
    float outerR = 0.36 + 0.04 * b;   // ring radius pulses with bass
    float freq   = audio(t);
    float barLen = freq * 0.30;
    float distO  = r - outerR;

    // Hard bar
    float barMask = smoothstep(-0.005,  0.002, distO)
                  * smoothstep(barLen + 0.012, barLen - 0.002, distO);
    // Soft halo behind the bar
    float haloMask = smoothstep(-0.018, 0.002, distO)
                   * smoothstep(barLen + 0.065, barLen, distO);

    vec3 barCol = palette(t + iTime * 0.07);
    col += barCol * barMask  * (0.7 + 0.6 * freq);
    col += barCol * haloMask * 0.20 * freq;

    // Bright spark at each frequency peak
    float isPeak = smoothstep(0.55, 0.85, freq);
    float spark  = smoothstep(0.015, 0.0, abs(r - (outerR + barLen))) * isPeak;
    col += vec3(1.0) * spark * freq;

    // ------------------------------------------------------------------
    // Inner ring – low / mid frequencies, bars radiate inward
    // ------------------------------------------------------------------
    float innerR  = 0.22;
    float freq2   = audio(t * 0.35);   // squeeze index into bass/low-mid range
    float barLen2 = freq2 * 0.14;
    float distI   = innerR - r;        // positive inside the ring surface

    float bar2Mask = smoothstep(-0.003, 0.001, distI)
                   * smoothstep(barLen2 + 0.008, barLen2, distI);
    float halo2    = smoothstep(-0.012, 0.001, distI)
                   * smoothstep(barLen2 + 0.042, barLen2, distI);

    vec3 barCol2 = palette(t + 0.5 + iTime * 0.05);
    col += barCol2 * bar2Mask * (0.5 + 0.5 * freq2);
    col += barCol2 * halo2    * 0.15 * freq2;

    // ------------------------------------------------------------------
    // Ring outlines
    // ------------------------------------------------------------------
    float outerLine = smoothstep(0.006, 0.001, abs(r - outerR));
    float innerLine = smoothstep(0.004, 0.001, abs(r - innerR));
    col += palette(t + iTime * 0.04)         * outerLine * 0.35;
    col += palette(t + 0.5 + iTime * 0.04)  * innerLine * 0.25;

    // ------------------------------------------------------------------
    // Central orb – pulses brightly on the beat
    // ------------------------------------------------------------------
    float orb = smoothstep(0.06 + 0.022 * b, 0.0, r);
    col += palette(iTime * 0.09) * orb * (0.8 + 0.8 * b);

    // ------------------------------------------------------------------
    // Vignette & tone mapping
    // ------------------------------------------------------------------
    col *= 1.0 - 0.55 * smoothstep(0.44, 0.88, r);
    col  = col / (col + 0.6);                           // filmic HDR
    col  = pow(max(col, 0.0), vec3(0.88));              // gentle gamma

    gl_FragColor = vec4(col, 1.0);
}
