import * as THREE from 'three';

const c = 299792458.0;
const G = 6.6743e-11;
export class BlackHole {
	mass: number;
	pos: THREE.Vector2;
	eventHorizon: number;
	sphere: THREE.Mesh = new THREE.Mesh();

	constructor(mass: number, pos: THREE.Vector2) {
		this.mass = mass;
		this.pos = pos;
		this.eventHorizon = (2 * G * this.mass) / (c * c);
		this.sphere.position.set(this.pos.x, this.pos.y, 0);
	}

	draw(): THREE.Mesh {
		this.sphere.material = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
		this.sphere.geometry = new THREE.IcosahedronGeometry(this.eventHorizon, 2);

		return this.sphere;
	}
	step(): void {
		this.sphere.rotation.x += 0.01;
		this.sphere.rotation.y += 0.01;
	}
}
