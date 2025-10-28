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

	draw(gl: WebGLRenderingContext, program: WebGLProgram): void {
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
		const verticesF = new Float32Array(vertices)
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, verticesF, gl.STATIC_DRAW);
		const a_position = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(a_position);
		gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesF.length / 2);
	}
}
