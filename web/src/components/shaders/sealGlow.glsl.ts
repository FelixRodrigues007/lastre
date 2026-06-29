/** Radial seal glow — accent shader for cards and panels. */

export const SEAL_GLOW_VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const SEAL_GLOW_FRAG = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;
uniform float u_intensity;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 center = vec2(0.5 + sin(u_time * u_speed * 0.3) * 0.08, 0.45 + cos(u_time * u_speed * 0.25) * 0.06);
  float dist = length(uv - center);
  float glow = exp(-dist * 3.5) * u_intensity;
  float pulse = 0.85 + sin(u_time * u_speed * 0.8) * 0.15;
  vec3 seal = vec3(0.698, 0.929, 0.592);
  vec3 col = seal * glow * pulse;
  float alpha = glow * 0.7;
  gl_FragColor = vec4(col, alpha);
}
`;
