export const fragmentShader = /*glsl*/ `
precision mediump float;

varying vec2 vUv;

uniform int u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform float u_far;

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  // Calculate ray direction from UV coordinates
  vec3 rayDir = normalize(vec3(uv, -1.0));
  vec3 ray = u_camPos - rayDir * u_far;

  vec3 color = vec3(1.0,1.0,0.0);
  if (ray.x > 1.0) {
    color = vec3(0.0,1.0,0.0);
  }
  
  gl_FragColor = vec4(color, 1.0);
}
`;
