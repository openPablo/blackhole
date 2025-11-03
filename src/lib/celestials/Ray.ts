import { Vertex } from './Vertex';

export var rayFshader = `
precision mediump float;
varying float v_alpha;

void main() {
    gl_FragColor = vec4(1.0, 1.0, 1.0, v_alpha);
}
`;

export var rayVshader = `
attribute vec2 a_position;
attribute float a_alpha;
varying float v_alpha;

void main() {
    v_alpha = a_alpha;
    gl_PointSize = 5.0;
    gl_Position = vec4(a_position, 1.0);
}
`;


export class Ray {
	pos: Vertex;
	direction: Vertex;
	speed = 0.01;
    trail: number[] = [];

	constructor(pos: Vertex, direction: Vertex) {
		this.pos = pos;
		this.direction = direction;
        this.trail.push(this.pos.x, this.pos.y)
	}

	step() {
		this.pos.x += this.direction.x * this.speed;
		this.pos.y += this.direction.y * this.speed;
        this.trail.push(this.pos.x, this.pos.y)
	}

	draw(gl: WebGLRenderingContext, program: WebGLProgram): void {
        for (let i = 1; i > 0; i -= 0.1) {
            
        }
		const a_position = gl.getAttribLocation(program, 'a_position');
		const a_alpha = gl.getAttribLocation(program, 'a_alpha');

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        for (var i = this.trail.length; this.trail.length)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.trail), gl.STATIC_DRAW);


		const stride = 3 * 4;
		gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(a_position);

		gl.vertexAttribPointer(a_alpha, 1, gl.FLOAT, false, stride, 8);
		gl.enableVertexAttribArray(a_alpha);


		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        
		gl.drawArrays(gl.POINTS, 0, this.trail.length / 3);
		gl.disable(gl.BLEND);
	}
}
