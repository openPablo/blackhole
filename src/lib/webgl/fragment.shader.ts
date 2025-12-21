export const fragmentShader = /*glsl*/ `
precision highp float;
varying vec2 vUv;

const float PI = 3.141592653589793238462643;
const float sunRadius = 0.2;
const float accretionThickness = 0.004;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform mat4 u_viewMatrix;
uniform vec3 u_starPos;
uniform sampler2D u_spaceTexture;
uniform sampler2D u_starTexture;

// d2R equation (Orbital Plane form)
// derived from geodesic eq with theta=pi/2, dtheta=0
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
vec4 blend(vec4 top, vec4 bottom){
  return vec4(top.rgb * top.a + bottom.rgb * (1.0 - top.a), 1.0);
}
float hash(float n) { 
    return fract(sin(n) * 43758.5453123); 
}
void main() {

  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ray = u_camPos; 
  vec3 rayDir = normalize(mat3(u_viewMatrix) * vec3(uv, -1.0));
 
  float r = length(ray);
  float phi = 0.0;
 // We define a local coordinate system (X, Y) in the plane of the ray's motion.
  vec3 orbitalX = normalize(ray); // Unit vector pointing to start position
  vec3 angularMomentumVec = cross(ray, rayDir);
  float h = length(angularMomentumVec); // Angular momentum per unit mass (conserved)
  
  vec3 orbitalY;
  
  if (h < 1e-6) {
    // Arbitrary Y if radial (phi will stay 0 anyway)
    orbitalY = vec3(0.0, 1.0, 0.0); 
    // If X is essentially Y, pick Z.
    if (abs(dot(orbitalX, orbitalY)) > 0.99) orbitalY = vec3(0.0, 0.0, 1.0);
  } else {
    // Y is perpendicular to X and the Angular Momentum vector (Normal to plane)
    vec3 orbitalZ = normalize(angularMomentumVec); // Normal to plane
    orbitalY = cross(orbitalZ, orbitalX);
  }

  // Initial State in Orbital Frame
  float dr = dot(rayDir, orbitalX);
  float dphi = h / (r * r);

  // Energy Calculation (Conserved)
  float f = 1.0 - u_eventHorizon / r;
  float E = sqrt(dr * dr + f * h * h / (r * r));

  vec2 finalUv = vec2 (0.0);
  vec4 accretionColor = vec4(0.0);
  int hitType = 0;

  int i = 0;
  float step = 0.005;
  while (i < 600 && r <= 1.1) {
    ray = r * (cos(phi) * orbitalX + sin(phi) * orbitalY); // cartesian coords

    if (r <= u_eventHorizon * 1.001) {
      hitType = 1;
      break;
    }
if (abs(ray.y) <= accretionThickness && r <= u_eventHorizon + 0.3) {
    float rnd = hash(floor(r * 50.0));
    float wave = sin(r * 320.0 + rnd * 6.28);
    
    // Inline color and gap logic
    float shift = clamp(smoothstep(u_eventHorizon, u_eventHorizon + 0.3, r) + mix(0.4, 0.0, wave * 0.5 + 0.5), 0.0, 1.0);
    float mask = smoothstep(u_eventHorizon + 0.005, u_eventHorizon + 0.1, r);
    float thres = mix(-0.5, 0.1, rnd);
    float gaps = smoothstep(thres, thres + 0.08, mix(1.0, wave, mask));

    // Density and final assignment
    float d = pow(max(1.0 - (r - u_eventHorizon) / 0.3, 0.0), 3.0) * gaps;
    accretionColor = vec4(mix(vec3(2, 2.5, 5), vec3(0.02, 0.05, 0.2), shift), clamp(d, 0.0, 1.0));
}
    if (r >= 1.0) {
      finalUv = vec2(
          atan(ray.z, ray.x) / (2.0 * PI) + 0.5, // u
          asin(ray.y) / PI + 0.5                 // v
        );
      hitType = 2;
      break;
    }
    if(r >= 0.35 && r<= 0.85 && distance(u_starPos, ray) <= sunRadius){
      vec3 relDir = normalize(ray - u_starPos);
      finalUv = vec2(
          atan(relDir.z, relDir.x) / (2.0 * PI) + 0.5, // u
          asin(relDir.y) / PI + 0.5                    // v
      );
      hitType = 3;
      break;
    }

    f = 1.0 - u_eventHorizon / r;
  
    dphi = h / (r * r);    
    dr += calcD2r(E, f, r, dr, dphi) * step;
    r += dr * step;
    phi += dphi * step;
    
    i++;
  }

  // setting the frag color outside the while loop solved a visual bug, by allowing the GPU to optimize
  if (hitType == 1) {
    gl_FragColor = blend(accretionColor, vec4(0.0,0.0,0.0,1.0));
  } else if (hitType == 2) {
    gl_FragColor = blend(accretionColor, sampleSeamless(u_spaceTexture, finalUv));
  } else if (hitType == 3) {
    gl_FragColor = blend(accretionColor, sampleSeamless(u_starTexture, finalUv));
  }
}
`;
