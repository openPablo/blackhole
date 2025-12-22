<script lang="ts">
	import { onMount } from 'svelte';
	import { BlackHole } from '$lib/celestials/BlackHole';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
	import { fragmentShader } from '$lib/webgl/fragment.shader';
	import { vertexShader } from '$lib/webgl/vertex.shader';
	import './styles.css';

	let container: HTMLDivElement;
	let progress = 0;
	let loading = true;
	let showInfo = false;

	onMount(() => {
		const manager = new THREE.LoadingManager();
		manager.onProgress = (url, itemsLoaded, itemsTotal) => {
			progress = (itemsLoaded / itemsTotal) * 100;
		};
		manager.onLoad = () => {
			progress = 100;
			setTimeout(() => {
				loading = false;
			}, 500);
		};

		const textureLoader = new THREE.TextureLoader(manager);
		const scene = new THREE.Scene();
		const renderer = new THREE.WebGLRenderer();

		const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 0.01);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		const camera = new THREE.Camera();
		camera.position.set(0, 0.3, -0.9);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;
		controls.autoRotateSpeed = 2.0;
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
			u_starPos: { value: blackHole.orbitalSunPos },
			u_spaceTexture: { value: textureLoader.load('space.png') },
			u_starTexture: { value: textureLoader.load('star1.png') }
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
		const handleResize = () => {
			renderer.setSize(window.innerWidth, window.innerHeight);
			uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
		};
		window.addEventListener('resize', handleResize);
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

<div class="ui-layer">
	<div class="buttons">
		<a
			href="https://github.com/openpablo/blackhole"
			target="_blank"
			rel="noopener noreferrer"
			class="btn github-btn"
			aria-label="GitHub"
		>
			<svg
				viewBox="0 0 24 24"
				width="24"
				height="24"
				stroke="currentColor"
				stroke-width="2"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path
					d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
				></path></svg
			>
		</a>
		<button onclick={() => (showInfo = true)} class="btn info-btn" aria-label="Info">
			<svg
				viewBox="0 0 24 24"
				width="24"
				height="24"
				stroke="currentColor"
				stroke-width="2"
				fill="none"
				stroke-linecap="round"
				stroke-linejoin="round"
				><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line
					x1="12"
					y1="8"
					x2="12.01"
					y2="8"
				></line></svg
			>
		</button>
	</div>

	{#if showInfo}
		<div
			class="modal-backdrop"
			onclick={(e) => {
				if (e.target === e.currentTarget) showInfo = false;
			}}
			role="button"
			tabindex="0"
			onkeydown={(e) => e.key === 'Escape' && (showInfo = false)}
		>
			<div class="modal" role="dialog" aria-modal="true" tabindex="-1">
				<h2>WebGL Blackhole</h2>
				<p>
					<strong>Simulated Mass:</strong> 20,000 Sol<br />
				</p>

				<p>Raytraces every pixel on your screen like it's a ray of light.</p>
				<p>
					Uses Schwarzschild's geodesics to calculate how the light rays are affected by the
					blackhole's gravity.
				</p>
				<p>
					Raytracing every pixel is very resource intensive, that's why I wrote this in a WebGL
					fragment shader.
				</p>
				<p>Fragment shaders are optimized for GPU computing, and use GLSL, a C like language.</p>
				<p>
					This scene is optimized to run smoothly on a mobile phone or a laptop with integrated
					graphics.
				</p>
				<button class="close-btn" onclick={() => (showInfo = false)}>Close</button>
			</div>
		</div>
	{/if}
</div>

{#if loading}
	<div class="loading-overlay">
		<div class="loading-text">Loading...</div>
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>
	</div>
{/if}
