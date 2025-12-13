<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import * as THREE from 'three';
	import { fragmentShader } from '$lib/webgl/fragment.shader';
	import { vertexShader } from '$lib/webgl/vertex.shader';
	import { ThreeMFLoader } from 'three/examples/jsm/Addons.js';

	let container: HTMLDivElement;

	onMount(() => {
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 0.01);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const blackHole: BlackHole = new BlackHole(
			200_000_000_000_000_000_000_000_000,
			new THREE.Vector3(0, 0, 0)
		);
		console.log(blackHole.eventHorizon);
		const uniforms = {
			u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			u_eventHorizon: { value: blackHole.eventHorizon },
			u_camPos: { value: camera.position },
			u_stars: { value: generateBigStars(20) }
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
	function generateBigStars(maxSize: number): THREE.Vector4[] {
		let stars: THREE.Vector4[] = [];
		for (var i = 0; i < maxSize; i++) {
			var phi = Math.random() * 2 * Math.PI;
			var theta = Math.acos(2 * Math.random() - 1);
			var size = 0.1 + Math.random() * 0.1;
			var redHue = 0.55 + Math.random() * 0.45;
			console.log(phi);
			stars.push(new THREE.Vector4(phi, theta, size, redHue));
		}
		return stars;
	}
</script>

<div bind:this={container} class="w-full h-full fixed top-0 left-0"></div>
