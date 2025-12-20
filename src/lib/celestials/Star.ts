import { Vector3 } from 'three';

export class Star {
	radius: number;
	pos: Vector3;
	color: Vector3;

	constructor() {
		this.radius = 0.01 + Math.random() * 0.1;
		this.color = new Vector3(
			0.6 + Math.random() * 0.4,
			0.7 + Math.random() * 0.2,
			0.4 + Math.random() * 0.6
		);
		this.pos = new Vector3().setFromSphericalCoords(
			0.6, //radius
			Math.PI / 2, //phi
			5.0 //theta
		);
	}
}
