import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BlackHole } from './BlackHole';
import { fragmentShader } from './fragment.shader';
import { vertexShader } from './vertex.shader';
import './styles.css';

const container = document.getElementById('container')!;
const loadingOverlay = document.getElementById('loading')!;
const progressFill = document.getElementById('progress-fill')!;
const infoModal = document.getElementById('info-modal')!;

// Info modal
const setInfoVisible = (visible: boolean) => (infoModal.hidden = !visible);
document.getElementById('info-btn')!.addEventListener('click', () => setInfoVisible(true));
document.getElementById('close-btn')!.addEventListener('click', () => setInfoVisible(false));
infoModal.addEventListener('click', (e) => {
	if (e.target === infoModal) setInfoVisible(false);
});
window.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') setInfoVisible(false);
});

// Loading progress
const manager = new THREE.LoadingManager();
manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
	progressFill.style.width = `${(itemsLoaded / itemsTotal) * 100}%`;
};
manager.onLoad = () => {
	progressFill.style.width = '100%';
	setTimeout(() => loadingOverlay.remove(), 500);
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

const blackHole = new BlackHole(20_000_000_000_000_000_000_000_000, new THREE.Vector3(0, 0, 0));
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
	new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
);
scene.add(quad);

window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight);
});

function animate() {
	controls.update();
	camera.updateMatrixWorld();
	uniforms.u_camPos.value.copy(camera.position);
	uniforms.u_viewMatrix.value.copy(camera.matrix);

	requestAnimationFrame(animate);
	renderer.render(scene, orthoCamera);
}
animate();
