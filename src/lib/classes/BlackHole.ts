import { Vertex } from './Vertex.ts';

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

	draw(gl: WebGLRenderingContext): void {
		const vertices: number[] = [this.pos.x, this.pos.y];
		for (let i = 0; i < 200; i++) {
			let angle = (i * 2 * Math.PI) / 200;
			vertices.push(
				Math.sin(angle) * this.eventHorizon + this.pos.x,
				Math.cos(angle) * this.eventHorizon + this.pos.y
			);
		}
		const verticesF = new Float32Array(vertices);
		gl.bufferData(gl.ARRAY_BUFFER, verticesF, gl.STATIC_DRAW);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesF.length / 2);
	}
}
