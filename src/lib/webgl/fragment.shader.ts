export const fragmentShader = /*glsl*/ `
precision highp float;
varying vec2 vUv;

struct Celestial {
  float radius;  
  vec3 pos;
  vec3 color;  
};
const float PI = 3.141592653589793238462643;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform mat4 u_viewMatrix;
uniform Celestial u_stars[1];
uniform sampler2D u_spaceTexture;

// d2R equation (Orbital Plane form)
// derived from geodesic eq with theta=pi/2, dtheta=0
// d2R = - (Rs/2r^2) * f * (dt)^2 + (Rs/2r^2f) * dr^2 + r * f * dphi^2
// Substitute dt = E/f:
// d2R = - (Rs/2r^2) * (E*E/f) + (Rs/2r^2f) * dr^2 + r * f * dphi^2
float calcD2r(float E, float f, float r, float dr, float dphi){    
    return -(u_eventHorizon / (2.0 * r * r)) * (E * E / f)
    + (u_eventHorizon / (2.0 * r * r * f)) * dr * dr
    + r * f * dphi * dphi;
}


void main() {

  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ray = u_camPos; 
  vec3 rayDir = normalize(mat3(u_viewMatrix) * vec3(uv, -1.0));

  // Every geodesic in Schwarzschild spacetime is planar.
  // We define a local coordinate system (X, Y) in the plane of the ray's motion.
  float r = length(ray);
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
  float phi = 0.0; // Start at angle 0 in our defined plane
  float dr = dot(rayDir, orbitalX); // Radial velocity
  // Tangential velocity is dot(rayDir, orbitalY), which corresponds to r*dphi
  // But we know r*r*dphi = h, so dphi = h / r^2.
  
  // Energy Calculation (Conserved)
  float f = 1.0 - u_eventHorizon / r;
  float E = sqrt(dr * dr + f * h * h / (r * r));

  vec2 finalUv = vec2 (0.0);
  int hitType = 0;
  int i = 0;
  float step = 0.005;
  while (i < 600 && r <= 1.1) {
    
    if (r <= u_eventHorizon * 1.01) {
      hitType = 1;
      break;
    }
    ray = r * (cos(phi) * orbitalX + sin(phi) * orbitalY); // transform to cartesian coords

    if (r >= 1.0) {
      finalUv = vec2(
          atan(ray.z, ray.x) / (2.0 * PI) + 0.5, // u
          asin(ray.y) / PI + 0.5                 // v
        );
      hitType = 2;
      break;
    }
    if(distance(u_stars[0].pos, ray) <= u_stars[0].radius){
      hitType = 3;
      break;
    }

    f = 1.0 - u_eventHorizon / r;    
    // dphi is determined by conservation of angular momentum
    float dphi = h / (r * r);
    

    dr += calcD2r(E, f, r, dr, dphi) * step;
    r += dr * step;
    phi += dphi * step;
    
    i++;
  }

  if (hitType == 1) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  } else if (hitType == 2) {
    gl_FragColor = texture2D(u_spaceTexture, finalUv);
  } else if (hitType == 3) {
    gl_FragColor = vec4(u_stars[0].color, 1.0);
  } else {
    gl_FragColor = vec4(0.0, 0.0, 0.1, 1.0);
  }
}
`;
