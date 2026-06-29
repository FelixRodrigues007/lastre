/** Liquid metal vortex — raymarch-inspired swirl, 21st.dev / dhiluxui pattern. */

export const LIQUID_METAL_VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const LIQUID_METAL_FRAG = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_intensity;
uniform float u_hue;

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  uv.x *= u_resolution.x / u_resolution.y;
  float t = u_time * u_speed;

  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float twist = a + r * 4.5 - t * 1.8;
  vec2 domain = vec2(cos(twist) * r, sin(twist) * r);
  float field = fbm(domain * 3.0 + t * 0.4);
  float vortex = smoothstep(0.15, 0.95, 1.0 - r) * field;

  vec3 metalLight = hsl2rgb(vec3(u_hue / 360.0, 0.35, 0.92));
  vec3 metalMid = hsl2rgb(vec3((u_hue + 12.0) / 360.0, 0.55, 0.55));
  vec3 metalDark = vec3(0.04, 0.04, 0.05);

  float spec = pow(max(0.0, sin(twist * 6.0 + field * 8.0 + t * 2.0)), 3.0);
  vec3 col = mix(metalDark, metalMid, vortex);
  col = mix(col, metalLight, spec * 0.65);
  col += metalLight * pow(vortex, 2.5) * 0.35 * u_intensity;

  float alpha = smoothstep(1.05, 0.25, r) * (0.35 + vortex * 0.55) * u_intensity;
  gl_FragColor = vec4(col, alpha);
}
`;
