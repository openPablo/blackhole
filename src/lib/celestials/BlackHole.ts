import * as THREE from 'three';

const c = 299792458.0;
const G = 6.6743e-11;
export class BlackHole {
	mass: number;
	pos: THREE.Vector3;
	eventHorizon: number;
	sphere: THREE.Mesh = new THREE.Mesh();

	constructor(mass: number, pos: THREE.Vector3) {
		this.mass = mass;
		this.pos = pos;
		this.eventHorizon = (2 * G * this.mass) / (c * c);
		this.sphere.position.set(this.pos.x, this.pos.y, 0);
	}
}
