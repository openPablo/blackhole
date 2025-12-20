export const fragmentShader = /*glsl*/ `
precision highp float;

varying vec2 vUv;

struct Celestial {
  float radius;  
  vec3 pos;
  vec3 color;  
};
const int nrOfStars = 3;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform mat4 u_viewMatrix;
uniform Celestial u_stars[nrOfStars];


vec3 getPolarCoords(vec3 pos){
	float r = length(pos);
	float phi = atan(pos.y, pos.x);
	float theta = acos(pos.z / r);
  return vec3(r, phi, theta);
}

int getIndexOfIntersectingStar(vec3 ray){
  for (int i = 0; i < nrOfStars; i++) {
    if (distance(u_stars[i].pos, ray) <= u_stars[i].radius){
      return i;
    }
  }
  return -1;
}

// d2R equation (Orbital Plane form)
// derived from geodesic eq with theta=pi/2, dtheta=0
// d2R = - (Rs/2r^2) * f * (dt)^2 + (Rs/2r^2f) * dr^2 + r * f * dphi^2
// Substitute dt = E/f:
// d2R = - (Rs/2r^2) * (E*E/f) + (Rs/2r^2f) * dr^2 + r * f * dphi^2
float calcD2r(float E, float f, float r, float dr, float dphi){    
    float term1 = -(u_eventHorizon / (2.0 * r * r)) * (E * E / f);
    float term2 = (u_eventHorizon / (2.0 * r * r * f)) * dr * dr;
    float term3 = r * f * dphi * dphi;
    return term1 + term2 + term3;
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 ray = u_camPos; 
  vec3 rayDir = normalize(mat3(u_viewMatrix) * vec3(uv, -1.0));

  // Every geodesic in Schwarzschild spacetime is planar.
  // We define a local coordinate system (X, Y) in the plane of the ray's motion.
  // This avoids all polar singularities because we treat every ray as being on the "equator" of its own plane.
  
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
  // Null geodesic condition in plane: 0 = -f dt^2 + dr^2/f + r^2 dphi^2
  // E = f dt.
  // E = sqrt(dr^2 + f * r^2 * dphi^2)
  // Substitute dphi = h/r^2: E = sqrt(dr^2 + f * h^2 / r^2)
  float f_start = 1.0 - u_eventHorizon / r;
  float E = sqrt(dr * dr + f_start * h * h / (r * r));

  vec3 color = vec3(0.0, 0.0, 0.1);

  int i = 0;
  float step = 0.005;
  while (i < 400 && r <= 1.01) {
    
    if (r <= u_eventHorizon * 1.01) {
      color = vec3(0.0, 0.0, 0.0);
      break;
    }

    int k = getIndexOfIntersectingStar(r * (cos(phi) * orbitalX + sin(phi) * orbitalY)); // transform to cartesian coords
    if(k >= 0){
      color = u_stars[k].color;
      break;
    }

    float f = 1.0 - u_eventHorizon / r;    
    // dphi is determined by conservation of angular momentum
    float dphi = h / (r * r);
    

    dr += calcD2r(E, f, r, dr, dphi) * step;
    r += dr * step;
    phi += dphi * step;
    
    i++;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
