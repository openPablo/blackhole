import { Vertex } from './Vertex.js';

const c = 299792458.0;
const G = 6.6743e-11;
export class BlackHole {
	mass: number;
	pos: Vertex;
	eventHorizon: number;

	constructor(mass: number, pos: Vertex) {
		this.mass = mass;
		this.pos = pos;
		this.eventHorizon = (2 * G * this.mass) / (c * c);
	}

	draw(): Float32Array<ArrayBuffer> {
		console.log('EventHorizon: ', this.eventHorizon);
		const vertices: number[] = [this.pos.x, this.pos.y];
		const points = 100;
		for (let i = 0; i <= points; i++) {
			let angle = (i * 2 * Math.PI) / points;
			vertices.push(
				Math.sin(angle) * this.eventHorizon + this.pos.x,
				Math.cos(angle) * this.eventHorizon + this.pos.y
			);
		}
		return new Float32Array(vertices);
	}
}
