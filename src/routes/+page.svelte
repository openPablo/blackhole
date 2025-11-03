<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole, blackholeVshader, blackholeFshader } from '$lib/celestials/BlackHole';
	import { Ray, rayVshader, rayFshader } from '$lib/celestials/Ray';
	import { Vertex } from '$lib/celestials/Vertex';

	let canvas: HTMLCanvasElement;
	let gl: WebGLRenderingContext;

	onMount(() => {
		gl = canvas.getContext('webgl')!;

		var blackholeProgram = createProgram(gl, blackholeVshader, blackholeFshader);
		var rayProgram = createProgram(gl, rayVshader, rayFshader);

		const blackHole: BlackHole = new BlackHole(
			1_00_000_000_000_000_000_000_000_000,
			new Vertex(0, 0)
		);
		const ray: Ray = new Ray(new Vertex(-1, 0), new Vertex(1, 0));

		// Clear the canvas and set bg black
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		function loop() {
			gl.useProgram(blackholeProgram);
			blackHole.draw(gl, blackholeProgram);
			gl.useProgram(rayProgram);
			ray.draw(gl,rayProgram);
			ray.step();
			requestAnimationFrame(loop);
		}

		requestAnimationFrame(loop);
	});

	function createProgram(
		gl: WebGLRenderingContext,
		vshader: string,
		fshader: string
	): WebGLProgram {
		// Compile shaders
		var vs = gl.createShader(gl.VERTEX_SHADER)!;
		gl.shaderSource(vs, vshader);
		gl.compileShader(vs);

		var fs = gl.createShader(gl.FRAGMENT_SHADER)!;
		gl.shaderSource(fs, fshader);
		gl.compileShader(fs);

		var program = gl.createProgram();
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);
		return program;
	}
</script>

<canvas bind:this={canvas} width="1000" height="1000" style="display:block;margin:auto;"></canvas>

<style>
	canvas {
		background: #111;
	}
</style>
