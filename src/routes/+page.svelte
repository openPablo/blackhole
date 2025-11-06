<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import * as THREE from 'three';
	import { fragmentShader } from '$lib/webgl/fragment.shader';
	import { vertexShader } from '$lib/webgl/vertex.shader';

	let container: HTMLDivElement;

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const blackHole: BlackHole = new BlackHole(
			500_000_000_000_000_000_000_000_000,
			new THREE.Vector3(0, 0, 0)
		);
		console.log(blackHole.eventHorizon);
		const uniforms = {
			u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			u_eventHorizon: { value: blackHole.eventHorizon},
			u_camPos: { value: camera.position},
			u_far: {value: 100.0}
		};
		const quad = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.ShaderMaterial({
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				uniforms: uniforms
			})
		);
		scene.add(quad);

		function animate() {
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
		}
		animate();
	});
</script>

<div bind:this={container} class="w-full h-full fixed top-0 left-0"></div>
