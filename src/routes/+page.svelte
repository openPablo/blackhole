<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import { Ray } from '$lib/celestials/Ray';
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
			new THREE.Vector3(0, 0)
		);
		const rays: Ray[] = [];
		for (let i = -3; i < 3; i += 0.12) {
			const ray: Ray = new Ray(
				new THREE.Vector3(-4, i),
				new THREE.Vector3(1, 0),
				blackHole.eventHorizon
			);
			rays.push(ray);
		}
		for (let i = -3; i < 3; i += 0.12) {
			const ray: Ray = new Ray(
				new THREE.Vector3(-4, 0, i),
				new THREE.Vector3(1, 0, 0),
				blackHole.eventHorizon
			);
			rays.push(ray);
		}

		const quad = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.ShaderMaterial({
				vertexShader: vertexShader,
				fragmentShader: fragmentShader
			})
		);
		scene.add(quad);
		renderer.render(scene, camera);
	});
</script>

<div bind:this={container} class="w-full h-full fixed top-0 left-0"></div>
