import { Vector3 } from 'three';

const c = 299792458.0;
const G = 6.6743e-11;
export class BlackHole {
	mass: number;
	pos: Vector3;
	eventHorizon: number;

	constructor(mass: number, pos: Vector3) {
		this.mass = mass;
		this.pos = pos;
		this.eventHorizon = (2 * G * this.mass) / (c * c);
	}
}
