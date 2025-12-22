import { Vector3 } from 'three';

const c = 299792458.0;
const G = 6.6743e-11;
export class BlackHole {
	mass: number;
	pos: Vector3;
	eventHorizon: number;
	orbitalSunPos: Vector3;

	constructor(mass: number, pos: Vector3) {
		this.mass = mass;
		this.pos = pos;
		this.eventHorizon = (2 * G * this.mass) / (c * c);
		this.orbitalSunPos = new Vector3().setFromSphericalCoords(
			0.6, //radius
			Math.PI / 2, //phi
			5.0 //theta
		);
	}
}
