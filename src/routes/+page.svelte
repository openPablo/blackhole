<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import * as THREE from 'three';
	import { fragmentShader } from '$lib/webgl/fragment.shader';
	import { vertexShader } from '$lib/webgl/vertex.shader';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

	let container: HTMLDivElement;
	const right = new THREE.Vector3();
	const up = new THREE.Vector3();
	const forward = new THREE.Vector3();
	onMount(() => {
		const scene = new THREE.Scene();

		const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 0.01);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		camera.position.set(0, 0, -0.9);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;
		controls.autoRotateSpeed = 1.2;
		controls.target.set(0, 0, 0);
		controls.enableDamping = true;
		controls.dampingFactor = 0.05;

		const blackHole: BlackHole = new BlackHole(
			20_000_000_000_000_000_000_000_000,
			new THREE.Vector3(0, 0, 0)
		);
		const uniforms = {
			u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			u_eventHorizon: { value: blackHole.eventHorizon },
			u_stars: { value: blackHole.generateConsellation(20) },
			u_camPos: { value: camera.position },
			u_camRight: { value: right },
			u_camUp: { value: up },
			u_camForward: { value: forward }
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
			controls.update();
			camera.updateMatrixWorld();
			uniforms.u_camPos.value.copy(camera.position);

			camera.matrixWorld.extractBasis(right, up, forward);
			forward.negate();

			uniforms.u_camRight.value.copy(right);
			uniforms.u_camUp.value.copy(up);
			uniforms.u_camForward.value.copy(forward);
			requestAnimationFrame(animate);
			renderer.render(scene, orthoCamera);
		}
		animate();
	});
</script>

<div role="presentation" bind:this={container} class="w-full h-full fixed top-0 left-0"></div>
