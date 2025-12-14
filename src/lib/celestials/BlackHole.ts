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
	generateConsellation(maxSize: number): THREE.Vector4[] {
		let stars: THREE.Vector4[] = [];
		for (var i = 0; i < maxSize; i++) {
			var phi = Math.random() * 2 * Math.PI; // Stars are generated on a sphere, use polar coordinates where only phi and theta change but R stays the same.
			var theta = Math.acos(2 * Math.random() - 1);
			var size = 0.01 + Math.random() * 0.1;
			var redHue = 0.55 + Math.random() * 0.45;
			stars.push(new THREE.Vector4(phi, theta, size, redHue));
		}
		return stars;
	}
}
