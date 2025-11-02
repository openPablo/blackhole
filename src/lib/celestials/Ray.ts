import { Vertex } from './Vertex';

export var rayVshader = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

export var rayFshader = `
precision mediump float;
void main() {

  // Set fragment color: vec4(r, g, b, alpha)
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

class Ray {
    pos: Vertex

    constructor (pos: Vertex){
        this.pos = pos
    }

    draw(gl: WebGLRenderingContext, program: WebGLProgram): void{
        gl.bufferData( gl.ARRAY_BUFFER, this.pos.getFloat32(), gl.STATIC_DRAW );
        gl.drawArrays( gl.POINTS, 0, 1 );
    }
}