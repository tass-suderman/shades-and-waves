// Classic plasma effect using layered sine waves
precision highp float;

uniform float iTime;
uniform vec2 iResolution;

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float x = uv.x * 6.0 - 3.0;
    float y = uv.y * 6.0 - 3.0;

    float v = 0.0;
    v += sin(x + iTime);
    v += sin(y + iTime * 0.7);
    v += sin(x + y + iTime * 0.5);
    v += sin(sqrt(x * x + y * y + 1.0) + iTime);

    vec3 col;
    col.r = sin(v * 3.14159);
    col.g = sin(v * 3.14159 + 2.094);
    col.b = sin(v * 3.14159 + 4.189);

    gl_FragColor = vec4(col * 0.5 + 0.5, 1.0);
}
