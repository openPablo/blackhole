export const fragmentShader = /*glsl*/ `
precision highp float;

varying vec2 vUv;

struct Celestial {
  float radius;  
  vec3 pos;
  vec3 color;  
};
const int nrOfStars = 20;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform mat4 u_viewMatrix;
uniform Celestial u_stars[nrOfStars];


vec3 getPolarCoords(vec3 pos){
	float r = length(pos);
  return vec3(
    r,                  //r
    atan(pos.y, pos.x), //phi
    acos(pos.z / r)     //theta
  );
}

vec3 getCartesianCoords(vec3 polar) {
  return vec3(
    polar.x * sin(polar.z) * cos(polar.y), //x
    polar.x * sin(polar.z) * sin(polar.y), //y
    polar.x * cos(polar.z)                 //z
  );
}

int getIndexOfIntersectingStar(vec3 ray){
  for (int i = 0; i < nrOfStars; i++) {
    if (distance(u_stars[i].pos, ray) <= u_stars[i].radius){
      return i;
    }
  }
  return 0;
}

void main() {
  // Transform coords of pixel that we're drawing to match 0,0 being the center of the screen
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  // uv are the coordinates of the pixel on the screen, which we're drawing with a quad tex.
  // transform these uv coordinates to the viewmatrix, which is what the camera is pointing to
  vec3 ray = u_camPos; 
  vec3 rayDir = normalize(mat3(u_viewMatrix) * vec3(uv, -1.0));

  // 1. Define the orbital plane basis
  vec3 e1 = normalize(ray); 
  vec3 e2 = normalize(rayDir - dot(rayDir, e1) * e1);

  // 2. Initial conditions for u = 1/r
  float r = length(ray);
  float u = 1.0 / r;
  
  // Angular momentum / Impact parameter logic
  // du/dphi = - (dr/dphi) / r^2
  float dr_ds = dot(rayDir, e1);
  float rdphi_ds = dot(rayDir, e2);
  float du = - (dr_ds / rdphi_ds) * u;

  float phi = 0.0;
  float step = 0.05; 
  vec3 color = vec3(0.0, 0.0, 0.1);

  for (int i = 0; i < 400; i++) {
    // Schwarzschild geodesic equation for light: d2u/dphi2 + u = 1.5 * rs * u^2
    float d2u = -u + 1.5 * u_eventHorizon * u * u;
    
    u += du * step;
    du += d2u * step;
    phi += step;

    ray = (cos(phi) * e1 + sin(phi) * e2) * 1.0 / u;

    if (u <= 0.0) {
      color = vec3(0.1, 0.1, 0.2); // Escape to infinity
      break;
    }
    int k = getIndexOfIntersectingStar(ray);
    if(k != 0){
      color = u_stars[k].color;
      break;
    }
    if (distance(ray, vec3(0,0,0))<= u_eventHorizon) {
      color = vec3(1.0); // Event Horizon
      break;
    }
  }
  gl_FragColor = vec4(color, 1.0);
}
`;
