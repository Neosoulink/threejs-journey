import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface initThreeProps {
	enableAnimation?: boolean;
	enableOrbit?: boolean;
	axesSizes?: number;
}

// DEFS
let scene: THREE.Scene;
let camera: THREE.Camera;
let renderer: THREE.WebGL1Renderer;

// FUNCTIONS
export function animate(callback: () => any = () => {}) {
	renderer.render(scene, camera);
	callback();
	requestAnimationFrame(() => animate(callback));
}

export default (props?: initThreeProps) => {
	const app = document.querySelector<HTMLDivElement>("#app")!;

	// SCENE & CAMERA
	scene = new THREE.Scene();

	// Perspective camera
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	// Orthographic Camera
	// const ASPECT_RATIO = window.innerWidth / window.innerHeight;
	// camera = new THREE.OrthographicCamera(
	// 	-1 * ASPECT_RATIO,
	// 	1 * ASPECT_RATIO,
	// 	1,
	// 	1,
	// 	0.1,
	// 	100
	// );
	// console.log(ASPECT_RATIO);

	renderer = new THREE.WebGL1Renderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);

	app.appendChild(renderer.domElement);

	// ORBIT CONTROL
	if (props?.enableOrbit) {
		// @ts-ignore: Will be used later
		const orbitControls = new OrbitControls(camera, renderer.domElement);
	}

	if (typeof props?.axesSizes === "number") {
		const AXES_HELPER = new THREE.AxesHelper(props?.axesSizes);
		scene.add(AXES_HELPER);
	}

	return {
		scene,
		camera,
		renderer,
		animate,
	};
};
