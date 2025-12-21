<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import { Star } from '$lib/celestials/Star';
	import * as THREE from 'three';
	import { fragmentShader } from '$lib/webgl/fragment.shader';
	import { vertexShader } from '$lib/webgl/vertex.shader';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

	let container: HTMLDivElement;
	onMount(() => {
		const scene = new THREE.Scene();

		const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 0.01);
		const renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const camera = new THREE.Camera();
		camera.position.set(0, 0.3, -0.9);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;
		controls.autoRotateSpeed = 2.0;
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
			u_camPos: { value: new THREE.Vector3() },
			u_viewMatrix: { value: new THREE.Matrix4() },
			u_starPos: { value: new Star().pos },
			u_spaceTexture: { value: new THREE.TextureLoader().load('space.png') },
			u_starTexture: { value: new THREE.TextureLoader().load('star1.png') }
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
			uniforms.u_viewMatrix.value.copy(camera.matrix);

			requestAnimationFrame(animate);
			renderer.render(scene, orthoCamera);
		}
		animate();
	});
</script>

<div role="presentation" bind:this={container} class="w-full h-full fixed top-0 left-0"></div>
