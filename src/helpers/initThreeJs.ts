import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// DEFS
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGL1Renderer;

// FUNCTIONS
export function animate() {
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

export default () => {
	const app = document.querySelector<HTMLDivElement>("#app")!;

	// SCENE & CAMERA
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	renderer = new THREE.WebGL1Renderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	app.appendChild(renderer.domElement);

	// ORBIT CONTROL
	// @ts-ignore: Will be used later
	const orbitControls = new OrbitControls(camera, renderer.domElement);

	// ANIMATION LOOP
	animate();

	return {
		scene,
		camera,
		renderer,
	};
};
