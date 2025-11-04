<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import { Ray } from '$lib/celestials/Ray';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

	let container: HTMLDivElement;

	onMount(() => {
		const scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);
		const controls = new OrbitControls( camera, renderer.domElement );

		const blackHole: BlackHole = new BlackHole(
			1000_000_000_000_000_000_000_000_000,
			new THREE.Vector3(0, 0)
		);
		const rays: Ray[] = []
		for(let i = -3; i < 3; i += 0.12) {
			const ray: Ray = new Ray(new THREE.Vector3(-4, i), new THREE.Vector3(1, 0), blackHole.eventHorizon);
			scene.add(ray.draw());
			rays.push(ray)
		}
		for(let i = -3; i < 3; i += 0.12) {
			const ray: Ray = new Ray(new THREE.Vector3(-4, 0, i), new THREE.Vector3(1, 0, 0), blackHole.eventHorizon);
			scene.add(ray.draw());
			rays.push(ray)
		}
		scene.add(blackHole.draw());

		camera.position.z = 5;
		function animate() {
			rays.forEach((ray) => {
				ray.step();
			})
			blackHole.step();
			controls.update();
			renderer.render(scene, camera);
		}
		renderer.setAnimationLoop(animate);
	});
</script>

<div bind:this={container} class="w-full h-full fixed top-0 left-0"></div>
