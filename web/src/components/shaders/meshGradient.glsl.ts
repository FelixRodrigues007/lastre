/** Mesh gradient fragment — bright, seal-dominant Lastre palette with a
 *  per-step accent hue (u_hue). Inspired by 21st.dev / NLACE Mesh Gradient. */

export const MESH_GRADIENT_VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const MESH_GRADIENT_FRAG = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_intensity;
uniform float u_grain;
uniform float u_hue;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * u_speed * 0.12;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Four drifting field centres, scaled to aspect so motion reads evenly.
  vec2 c1 = vec2((0.30 + sin(t * 0.7) * 0.16) * aspect, 0.32 + cos(t * 0.5) * 0.14); // seal — dominant
  vec2 c2 = vec2((0.78 + cos(t * 0.6) * 0.16) * aspect, 0.66 + sin(t * 0.8) * 0.12); // accent (per-step)
  vec2 c3 = vec2((0.55 + sin(t * 0.9 + 1.0) * 0.20) * aspect, 0.18 + cos(t * 0.4) * 0.16); // cream
  vec2 c4 = vec2((0.20 + cos(t * 0.55 + 2.0) * 0.14) * aspect, 0.86 + sin(t * 0.65) * 0.10); // highlight

  // Seal + accent get wide, high peaks (small epsilon) so the colour owns most
  // of the field; cream/highlight get low broad peaks (large epsilon) so they
  // only soften the corners. u_intensity widens the accent blob.
  float d1 = 1.0 / (length(p - c1) * 2.2 + 0.10); // seal — wide
  float d2 = 1.0 / (length(p - c2) * (3.0 - u_intensity * 0.7) + 0.10); // accent — width by intensity
  float d3 = 1.0 / (length(p - c3) * 3.0 + 0.55); // cream — broad, gentle
  float d4 = 1.0 / (length(p - c4) * 4.8 + 0.40); // highlight — small bright pop
  float total = d1 + d2 + d3 + d4;

  vec3 seal   = hsl2rgb(vec3(101.0 / 360.0, 0.67, 0.76)); // brand mint #B2ED97
  vec3 accent = hsl2rgb(vec3(u_hue / 360.0, 0.80, 0.55)); // per-step cool tone
  vec3 cream  = vec3(0.92, 0.95, 0.92);
  vec3 hi     = vec3(0.97, 0.99, 0.97);

  // Convex blend (weights sum to 1) — vivid and always in gamut, never blown out.
  vec3 col = (seal * d1 + accent * d2 + cream * d3 + hi * d4) / total;

  // Whisper of lift so darks never crush on the light band — keep it saturated.
  col = mix(col, vec3(0.95, 0.97, 0.94), 0.04);

  float n = noise(uv * u_resolution * 0.5 + t * 40.0);
  col += (n - 0.5) * u_grain * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`;
