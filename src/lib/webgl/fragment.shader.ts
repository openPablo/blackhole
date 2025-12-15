export const fragmentShader = /*glsl*/ `
precision highp float;

varying vec2 vUv;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform mat4 u_viewMatrix;

const int nrOfStars = 20;
uniform vec4 u_stars[nrOfStars];

vec3 getPolarCoords(vec3 pos){
	float r = length(pos);
	float phi = atan(pos.y, pos.x);
	float theta = acos(pos.z / r);
  return vec3(r, phi, theta);
}

vec3 getPolarVelocities(float r, float phi, float theta, vec3 dir){
  float dr = sin(theta) * cos(phi) * dir.x +
           sin(theta) * sin(phi) * dir.y +
           cos(theta) * dir.z;

  float dtheta = (cos(theta) * cos(phi) * dir.x +
                cos(theta) * sin(phi) * dir.y -
                sin(theta) * dir.z) / r;

  float dphi = (-sin(phi) * dir.x + cos(phi) * dir.y) / (r * sin(theta));
  return vec3(dr, dphi, dtheta);
}

float calcEnergy(float r, float theta, float dr, float dphi,float dtheta) {
    float f = 1.0 - u_eventHorizon / r;
    float dt_dlambda = sqrt(
        (dr * dr) / f +
        r * r * dtheta * dtheta +
        r * r * sin(theta) * sin(theta) * dphi * dphi
    );
    float E = f * dt_dlambda;
    return E;
}

vec3 calcSecondDerivatives(float E, vec3 polar, vec3 dPolar){
  // unpack vec3's to more readable vars
  float r     = polar.x;
  float phi   = polar.y;
  float theta = polar.z;
  float dr      = dPolar.x;
  float dphi    = dPolar.y;
  float dtheta  = dPolar.z;

  float f = 1.0 - u_eventHorizon / r;
  float dt_dlambda = E / f;

  // Radial acceleration
  float d2R = -(u_eventHorizon / (2.0 * r * r)) * f * dt_dlambda * dt_dlambda +
			        (u_eventHorizon / (2.0 * r * r * f)) * dr * dr + r *
				      (dtheta * dtheta + sin(theta) * sin(theta) * dphi * dphi);

  // Angular acceleration
  float d2Phi = -2.0 * dr * dphi / r - 2.0 * cos(theta) * dtheta * dphi / sin(theta);

  float d2Theta = -(2.0 / r) * dr * dtheta + sin(theta) * cos(theta) * dphi * dphi;

  return vec3(d2R, d2Phi, d2Theta);
}
float intersectsWithStar(float phi, float theta) {
  for (int i = 0; i < nrOfStars; i++) {
    float phi2 = u_stars[i].x;
    float theta2 = u_stars[i].y;
    float size = u_stars[i].z;

    float distance = acos(sin(theta) * sin(theta2) * cos(phi-phi2) +  cos(theta) * cos(theta2) );
    if (distance < size){
      return u_stars[i].w;
    }
  }
  return 0.0;
}

void main() {
  // Transform coords of pixel that we're drawing to match 0,0 being the center of the screen
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  // holy shit it took me way too long to figure this part
  // uv are the coordinates of the pixel on the screen, which we're drawing with a quad tex.
  // transform these uv coordinates to the viewmatrix, which is what the camera is pointing to
  vec3 ray = u_camPos; 
  vec3 rayDir = normalize(mat3(u_viewMatrix) * vec3(uv, -1.0));

  // Polar coordinates (blackhole is center of scene)
  vec3 polar  = getPolarCoords(ray);
  vec3 dPolar = getPolarVelocities(polar.x, polar.y, polar.z, rayDir);
  float E = calcEnergy(polar.x, polar.z, dPolar.x, dPolar.y, dPolar.z);

  vec3 color = vec3(0.0,0.0,0.1);

  int i= 0;
  float step = 0.005;
  while (i < 400 && polar.x <= 1.01) {
    if(polar.x <= u_eventHorizon * 1.01) {
      color = vec3(0.5,0.0,0.0);
      break;
    }

    if(polar.x >= 0.995 && polar.x <= 1.005) {
      float red = intersectsWithStar(polar.y,polar.z);
      if (red > 0.0){
        color = vec3(0.9,0.9,red);
      }
      break;
    }
    
    dPolar  += calcSecondDerivatives(E, polar, dPolar) * step;
    polar   += dPolar * step;
    i++;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
