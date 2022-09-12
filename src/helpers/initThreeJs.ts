import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export interface initThreeProps {
	enableOrbit?: boolean;
	axesSizes?: number;
	sceneSizes?: {
		width: number;
		height: number;
	};
	control?: OrbitControls;
	autoSceneResize?: boolean;
}

// DEFS
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGL1Renderer;
let control: OrbitControls;
let viewPortSize = {
	width: window.innerWidth,
	height: window.innerHeight,
};

// FUNCTIONS
export function animate(callback: () => any = () => {}) {
	renderer.render(scene, camera);
	callback();
	requestAnimationFrame(() => animate(callback));
}

export default (props?: initThreeProps) => {
	const APP = document.querySelector<HTMLDivElement>("#app")!;
	const SCENE_SIZES: initThreeProps["sceneSizes"] =
		props?.sceneSizes ?? viewPortSize;

	// SCENE & CAMERA
	scene = new THREE.Scene();

	// Perspective camera
	camera = new THREE.PerspectiveCamera(
		75,
		SCENE_SIZES.width / SCENE_SIZES.height,
		0.1,
		1000
	);

	// Orthographic Camera
	// const ASPECT_RATIO = SCENE_SIZES.width / SCENE_SIZES.height;
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
	renderer.setSize(SCENE_SIZES.width, SCENE_SIZES.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

	APP.appendChild(renderer.domElement);

	// ORBIT CONTROL
	if (props?.enableOrbit) {
		control = new OrbitControls(camera, renderer.domElement);
	}

	if (typeof props?.axesSizes === "number") {
		const AXES_HELPER = new THREE.AxesHelper(props?.axesSizes);
		scene.add(AXES_HELPER);
	}

	if (props?.autoSceneResize === undefined || props?.autoSceneResize === true) {
		window.addEventListener("resize", () => {
			viewPortSize.width = window.innerWidth;
			viewPortSize.height = window.innerHeight;

			camera.aspect = viewPortSize.width / viewPortSize.height;
			camera.updateProjectionMatrix();

			renderer.setSize(viewPortSize.width, viewPortSize.height);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		});
	}

	return {
		canvas: APP,
		scene,
		camera,
		renderer,
		animate,
		sceneSizes: SCENE_SIZES,
		control,
	};
};
