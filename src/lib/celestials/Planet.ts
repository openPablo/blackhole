import { Vector3 } from 'three';

export class Planet {
	radius: number;
	pos: Vector3;
	color: Vector3;

	constructor() {
		this.radius = 0.01 + Math.random() * 0.1;
		this.color = new Vector3(
			0.4 + Math.random() * 0.4,
			0.3 + Math.random() * 0.3,
			0.1 + Math.random() * 0.2
		);
		this.pos = new Vector3().setFromSphericalCoords(
			0.5 + Math.random() * 0.8, //radius
			Math.PI / 2, //phi
			Math.random() * Math.PI * 2 //theta
		);
	}
}
