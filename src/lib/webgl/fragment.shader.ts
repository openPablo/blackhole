export const fragmentShader = /*glsl*/ `
precision mediump float;

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

void main() {
  // glsl magic to set camera 
  vec2 uv = (vUv - 0.5) * 2.0;
  uv.x *= u_resolution.x / u_resolution.y;

  // Calculate ray direction from UV coordinates
  vec3 ray    = u_camPos - normalize(vec3(uv, -1.0)) * u_far;
  vec3 rayDir = normalize(vec3(uv, 1.0));

  // Polar coordinates = blackhole is center
  vec3 polar  = getPolarCoords(ray);
  vec3 dPolar = getPolarVelocities(polar.x, polar.y, polar.z, rayDir);
  float E = calcEnergy(polar.x, polar.z, dPolar.x, dPolar.y, dPolar.z);

  vec3 color = vec3(0.0,0.0,1.0);

  int i= 0;
  float step = 0.1;
  while (i < 500) {
    if(polar.x <= u_eventHorizon) {
      color = vec3(1.0,0.0,0.0);
      break;
    }

    if(polar.x > 50.0 * u_eventHorizon) {
      break;
    }
    
    polar += dPolar * step;
    i++;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;
