<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/classes/BlackHole.ts';
	import { Vertex } from '$lib/classes/Vertex.ts';

	let canvas;
	let gl: WebGLRenderingContext;

	onMount(() => {
		gl = canvas.getContext('webgl');

		const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

		const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
        gl_FragColor = u_color;
      }
    `;

		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexShaderSource);
		gl.compileShader(vertexShader);

		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentShaderSource);
		gl.compileShader(fragmentShader);

		const program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		gl.useProgram(program);

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

		const positionLocation = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		const colorLocation = gl.getUniformLocation(program, 'u_color');

		gl.clearColor(0.1, 0.1, 0.1, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0);

		const blackHole: BlackHole = new BlackHole(1, new Vertex(20, 20));
		blackHole.draw(gl, program);
	});
</script>

<canvas bind:this={canvas} width="1000" height="1000" style="display:block;margin:auto;"></canvas>

<style>
	canvas {
		background: #111;
	}
</style>
