// Simple raymarching with a shiny sphere
precision highp float;

uniform float iTime;
uniform vec2 iResolution;

float sdSphere(vec3 p, float r) {
    return length(p) - r;
}

float map(vec3 p) {
    vec3 q = p;
    q.y += sin(iTime * 0.8) * 0.3;
    return sdSphere(q, 1.0);
}

vec3 getNormal(vec3 p) {
    float e = 0.001;
    return normalize(vec3(
        map(p + vec3(e, 0.0, 0.0)) - map(p - vec3(e, 0.0, 0.0)),
        map(p + vec3(0.0, e, 0.0)) - map(p - vec3(0.0, e, 0.0)),
        map(p + vec3(0.0, 0.0, e)) - map(p - vec3(0.0, 0.0, e))
    ));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;
    vec3 ro = vec3(0.0, 0.0, 3.0);
    vec3 rd = normalize(vec3(uv, -1.0));

    float t = 0.0;
    vec3 col = vec3(0.05, 0.05, 0.1);

    for (int i = 0; i < 64; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);
        if (d < 0.001) {
            vec3 n = getNormal(p);
            vec3 light = normalize(vec3(1.0, 2.0, 2.0));
            float diff = max(dot(n, light), 0.0);
            float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);
            col = vec3(0.2, 0.5, 1.0) * diff + vec3(1.0) * spec * 0.5;
            col = mix(col, vec3(0.05, 0.05, 0.1), 1.0 - exp(-0.02 * t * t));
            break;
        }
        t += d;
        if (t > 20.0) break;
    }

    gl_FragColor = vec4(col, 1.0);
}
