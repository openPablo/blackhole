export const fragmentShader = /*glsl*/ `
precision highp float;

varying vec2 vUv;

uniform float u_eventHorizon;
uniform vec2 u_resolution;
uniform vec3 u_camPos;
uniform float u_far;

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
  float d2Phi = -(2.0 / r) * dr * dphi -
			          ((2.0 * cos(theta)) / sin(theta)) * dtheta * dphi;

  float d2Theta = -(2.0 / r) * dr * dtheta +
			            sin(theta) * cos(theta) * dphi * dphi;


  return vec3(d2R, d2Phi, d2Theta);
}

void main() {
  // Set camera 
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  // Calculate ray direction from Camera pos
  vec3 ray    = u_camPos - normalize(vec3(uv, -1.0)) * u_far;
  vec3 rayDir = normalize(vec3(uv, 1.0));

  // Polar coordinates (blackhole is center of scene)
  vec3 polar  = getPolarCoords(ray);
  vec3 dPolar = getPolarVelocities(polar.x, polar.y, polar.z, rayDir);
  float E = calcEnergy(polar.x, polar.z, dPolar.x, dPolar.y, dPolar.z);

  vec3 color = vec3(1.0,0.0,0.0);

  int i= 0;
  float step = 0.01;
  while (i < 200) {
    if(polar.x <= u_eventHorizon * 1.01) {
      color = vec3(0.0,0.0,0.5);
      break;
    }

    if(polar.x > 1000.0 * u_eventHorizon) {
      break;
    }
    
    dPolar  += calcSecondDerivatives(E, polar, dPolar) * step;
    polar   += dPolar * step;
    i++;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
