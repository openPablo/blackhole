export const fragmentShader = /*glsl*/ `
precision highp float;
varying vec2 vUv;

const float PI = 3.141592653589793238462643;
const float sunRadius = 0.2;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform mat4 u_viewMatrix;
uniform vec3 u_starPos;
uniform sampler2D u_spaceTexture;
uniform sampler2D u_starTexture;

float calcD2r(float E, float f, float r, float dr, float dphi){    
    return -(u_eventHorizon / (2.0 * r * r)) * (E * E / f)
    + (u_eventHorizon / (2.0 * r * r * f)) * dr * dr
    + r * f * dphi * dphi;
}

vec4 sampleSeamless(sampler2D tex, vec2 uv) {
  vec2 dX = dFdx(uv);
  vec2 dY = dFdy(uv);
  if (abs(dX.x) > 0.5) dX.x = fract(dX.x + 0.5) - 0.5;
  if (abs(dY.x) > 0.5) dY.x = fract(dY.x + 0.5) - 0.5;
  return textureGrad(tex, uv, dX, dY);
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ray = u_camPos; 
  vec3 rayDir = normalize(mat3(u_viewMatrix) * vec3(uv, -1.0));
 
  vec2 polar = vec2(0.0, length(ray)); // x: phi, y: r
  vec3 orbitalX = normalize(ray);
  vec3 angularMomentumVec = cross(ray, rayDir);
  float h = length(angularMomentumVec);
  
  vec3 orbitalY;
  if (h < 1e-6) {
    orbitalY = vec3(0.0, 1.0, 0.0); 
    if (abs(dot(orbitalX, orbitalY)) > 0.99) orbitalY = vec3(0.0, 0.0, 1.0);
  } else {
    orbitalY = cross(normalize(angularMomentumVec), orbitalX);
  }

  vec2 dPolar = vec2(h / (polar.y * polar.y), dot(rayDir, orbitalX)); // x: dphi, y: dr

  float f = 1.0 - u_eventHorizon / polar.y;
  float E = sqrt(dPolar.y * dPolar.y + f * h * h / (polar.y * polar.y));

  vec2 finalUv = vec2(0.0);
  int hitType = 0;
  float step = 0.005;

  for (int i = 0; i < 600; i++) {
    ray = polar.y * (cos(polar.x) * orbitalX + sin(polar.x) * orbitalY); // back to cartesian

    if (polar.y <= u_eventHorizon * 1.001) {
      hitType = 1;
      break;
    }

    if (polar.y >= 1.0) {
      finalUv = vec2(atan(ray.z, ray.x) / (2.0 * PI) + 0.5, asin(ray.y) / PI + 0.5);
      hitType = 2;
      break;
    }

    if (polar.y >= 0.35 && polar.y <= 0.85 && distance(u_starPos, ray) <= sunRadius) {
      vec3 relDir = normalize(ray - u_starPos);
      finalUv = vec2(atan(relDir.z, relDir.x) / (2.0 * PI) + 0.5, asin(relDir.y) / PI + 0.5);
      hitType = 3;
      break;
    }

    f = 1.0 - u_eventHorizon / polar.y;
    dPolar.x = h / (polar.y * polar.y);    
    dPolar.y += calcD2r(E, f, polar.y, dPolar.y, dPolar.x) * step;
    polar += dPolar * step;
  }

  if (hitType == 1) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else if (hitType == 2) {
    gl_FragColor = sampleSeamless(u_spaceTexture, finalUv);
  } else if (hitType == 3) {
    gl_FragColor = sampleSeamless(u_starTexture, finalUv);
  }
}
`;
