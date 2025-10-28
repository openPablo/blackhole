<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import { Vertex } from '$lib/celestials/Vertex';

	let canvas;
	let gl: WebGLRenderingContext;

	onMount(() => {
		gl = canvas.getContext('webgl');

		// Vertex shader
		var vshader = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

		// Fragment shader
		var fshader = `
precision mediump float;
void main() {

  // Set fragment color: vec4(r, g, b, alpha)
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`;

		// Compile the vertex shader
		var vs = gl.createShader(gl.VERTEX_SHADER)!;
		gl.shaderSource(vs, vshader);
		gl.compileShader(vs);

		// Compile the fragment shader
		var fs = gl.createShader(gl.FRAGMENT_SHADER)!;
		gl.shaderSource(fs, fshader);
		gl.compileShader(fs);

		// Create the WebGL program and use it
		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		gl.useProgram(program);

		// Log compilation errors, if any
		console.log('vertex shader:', gl.getShaderInfoLog(vs) || 'OK');
		console.log('fragment shader:', gl.getShaderInfoLog(fs) || 'OK');
		console.log('program:', gl.getProgramInfoLog(program) || 'OK');

		// Set the clear color (black)
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		// Clear the canvas
		gl.clear(gl.COLOR_BUFFER_BIT);
		const blackHole: BlackHole = new BlackHole(
			1_00_000_000_000_000_000_000_000_000,
			new Vertex(0, 0)
		);
		const verticesF = blackHole.draw();
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, verticesF, gl.STATIC_DRAW);
		const a_position = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(a_position);
		gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesF.length / 2);
	});
</script>

<canvas bind:this={canvas} width="1000" height="1000" style="display:block;margin:auto;"></canvas>

<style>
	canvas {
		background: #111;
	}
</style>
