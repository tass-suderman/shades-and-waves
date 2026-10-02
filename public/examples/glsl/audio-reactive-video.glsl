precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform sampler2D iChannel0, iChannel1, iChannel2, iChannel3, iChannel4;
uniform bool iChannel0Enabled, iChannel1Enabled, iChannel2Enabled, iChannel3Enabled, iChannel4Enabled;
uniform vec2 iChannel3Resolution;
uniform float iChannel1SampleRate, iChannel2SampleRate, iChannel4SampleRate;

// Upload files in Media & uniforms; enable webcam/mic with their toolbar buttons.
// Active video sources mix equally, as do active mic, Strudel and audio-file FFTs.
// Video audio is muted: upload a separate audio file to drive the effects.
const float VIDEO_ZOOM = 1.0;           // >1 zooms in on uploaded video only
const vec2 VIDEO_PAN = vec2(0.0, 0.0); // source offset; +x right, +y up
const float AUDIO_GAIN = 1.8;
const float BASS_WEIGHT = 0.85;         // 0 = broad spectrum, 1 = bass only
const float BASS_LOW_HZ = 40.0;
const float BASS_HIGH_HZ = 250.0;
const float BLOOM_STRENGTH = 1.4;       // 0 disables audio bloom
const float BLOOM_RADIUS = 8.0;         // pixels
const float BLOOM_THRESHOLD = 0.55;
const float VIGNETTE_STRENGTH = 0.85;   // 0 disables audio vignette
const float SHAKE_STRENGTH = 0.025;     // fraction of image height; 0 disables
const float SHAKE_SPEED = 12.0;

float spectrum(float hz) {
    float sum = 0.0, count = 0.0;
    if (iChannel1Enabled) { sum += texture2D(iChannel1, vec2(2.0 * hz / iChannel1SampleRate, 0.5)).r; count += 1.0; }
    if (iChannel2Enabled) { sum += texture2D(iChannel2, vec2(2.0 * hz / iChannel2SampleRate, 0.5)).r; count += 1.0; }
    if (iChannel4Enabled) { sum += texture2D(iChannel4, vec2(2.0 * hz / iChannel4SampleRate, 0.5)).r; count += 1.0; }
    return sum / max(count, 1.0);
}
vec3 scene(vec2 uv) {
    vec3 color = vec3(0.0);
    float count = 0.0;
    if (iChannel0Enabled) {
        color += texture2D(iChannel0, vec2(uv.x, 1.0 - uv.y)).rgb;
        count += 1.0;
    }
    if (iChannel3Enabled) {
        // Cover the viewport without distorting the uploaded video's aspect ratio.
        float ratio = (iResolution.x / iResolution.y) / (iChannel3Resolution.x / iChannel3Resolution.y);
        vec2 fit = vec2(min(ratio, 1.0), min(1.0 / ratio, 1.0));
        vec2 p = (uv - 0.5) * fit / max(VIDEO_ZOOM, 0.01) + 0.5 + VIDEO_PAN;
        color += texture2D(iChannel3, vec2(p.x, 1.0 - p.y)).rgb;
        count += 1.0;
    }
    return color / max(count, 1.0);
}
void main() {
    float bass = 0.0, broad = 0.0;
    for (int i = 0; i < 16; i++) {
        float t = (float(i) + 0.5) / 16.0;
        bass += spectrum(mix(BASS_LOW_HZ, BASS_HIGH_HZ, t));
        broad += spectrum(mix(40.0, 12000.0, t));
    }
    float energy = clamp(mix(broad, bass, clamp(BASS_WEIGHT, 0.0, 1.0)) * AUDIO_GAIN / 16.0, 0.0, 1.0);
    vec2 uv = gl_FragCoord.xy / iResolution;
    // Continuous oscillations avoid frame-to-frame random jumps; no history buffer needed.
    float t = iTime * SHAKE_SPEED;
    vec2 shake = vec2(sin(t * 1.13) + sin(t * 2.71), cos(t * 1.37) + sin(t * 2.33)) * 0.5;
    vec2 p = uv + shake * SHAKE_STRENGTH * energy * vec2(iResolution.y / iResolution.x, 1.0);
    vec3 color = scene(p);
    vec3 bloom = vec3(0.0);
    for (int i = 0; i < 12; i++) {
        float angle = float(i) * 6.2831853 / 12.0;
        vec2 offset = vec2(cos(angle), sin(angle)) * BLOOM_RADIUS / iResolution;
        bloom += max(scene(p + offset) - BLOOM_THRESHOLD, 0.0);
    }
    color += bloom / 12.0 * BLOOM_STRENGTH * energy;
    float edge = smoothstep(0.2, 0.72, length(uv - 0.5));
    color *= 1.0 - clamp(edge * VIGNETTE_STRENGTH * energy, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
}
