import { Vertex } from './Vertex';

export var blackholeFshader = `
precision mediump float;
void main() {

  //Red
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;
export var blackholeVshader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
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

	//draws a circle using triangles, there are no circle objects in webgl :)
	draw(gl: WebGLRenderingContext, program: WebGLProgram): void {

		const vertices: number[] = [this.pos.x, this.pos.y];
		const points = 100;
		for (let i = 0; i <= points; i++) {
			let angle = (i * 2 * Math.PI) / points;
			vertices.push(
				Math.sin(angle) * this.eventHorizon + this.pos.x,
				Math.cos(angle) * this.eventHorizon + this.pos.y
			);
		}
		const verticesF = new Float32Array(vertices);
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, verticesF, gl.STATIC_DRAW);
		const a_position = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(a_position);
		gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesF.length / 2);
	}
}
