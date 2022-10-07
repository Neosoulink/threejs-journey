import * as THREE from "three";
// import GSAP from "gsap";

// HELPERS
import initThreeJs from "./helpers/initThreeJs";
// COMPONENTS
import Cube from "./components/Cube";

// STYLES
import "./assets/css/style.css";

// DATA
const TRIANGLE_VERTICES = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);

// FORMS
const CubeClone = Cube.clone();
const TriangleGeometry = new THREE.BufferGeometry();
const TriangleMaterial = new THREE.MeshBasicMaterial({
	color: 0xff55ee,
	wireframe: true,
});
TriangleGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(TRIANGLE_VERTICES, 3)
);
const TriangleMesh = new THREE.Mesh(TriangleGeometry, TriangleMaterial);

const CubesGroup = new THREE.Group();
// let savedTime = Date.now();

// SCALES
Cube.scale.set(0.5, 0.5, 0.5);

// POSITIONS
Cube.position.set(0, 0, 0);
CubeClone.position.set(-3, -1, 0);
CubeClone.material.wireframe = true;

// ROTATIONS
Cube.rotation.reorder("YXZ");
Cube.rotation.set(Math.PI / 5, 3, 3);
CubeClone.rotation.set(Math.PI / 2, -1, 0, "YXZ");
// CubesGroup.rotation.z = 3;

// GROUPE
CubesGroup.add(Cube, CubeClone);

// CLOCK
const ANIMATION_CLOCK = new THREE.Clock();

const APP = initThreeJs({
	enableOrbit: true,
	axesSizes: 5,
});

APP.scene.add(CubesGroup);
APP.scene.add(TriangleMesh);

//
APP.camera.position.z = 10;

// GSAP
// GSAP.to(CubesGroup.position, { duration: 0.2, delay: 1, x: 1 });
// GSAP.to(CubesGroup.position, { duration: 0.2, delay: 2, x: 0 });

// CURSOR ANIMATION
// const CURSOR_POS = {
// 	x: 0,
// 	y: 0,
// };
// window.addEventListener("mousemove", (e) => {
// 	CURSOR_POS.x = e.clientX / APP.sceneSizes.width - 0.5;
// 	CURSOR_POS.y = e.clientY / APP.sceneSizes.height - 0.5;
// });

window.addEventListener("dblclick", () => {
	const fullscreenElement =
		// @ts-ignore: Safari fix ಥ‿ಥ
		document.fullscreenElement || document.webkitFullscreenElement;

	if (!fullscreenElement) {
		if (APP.canvas.requestFullscreen) {
			APP.canvas.requestFullscreen();
			// @ts-ignore: Safari fix ಥ‿ಥ
		} else if (APP.canvas.webkitRequestFullscreen) {
			// @ts-ignore: Safari fix ಥ‿ಥ
			APP.canvas.webkitRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			// @ts-ignore: Safari fix ಥ‿ಥ
		} else if (document.webkitExitFullscreen) {
			// @ts-ignore: Safari fix ಥ‿ಥ
			document.webkitExitFullscreen();
		}
	}
});

APP.control.enableDamping = true;
APP.animate(() => {
	// Animation using native js date
	// const CURRENT_TIME = Date.now();
	// const DELTA_TIME = CURRENT_TIME - savedTime;
	// savedTime = CURRENT_TIME;

	// ANIMATION using THREE clock
	const ELAPSED_TIME = ANIMATION_CLOCK.getElapsedTime();
	CubesGroup.rotation.y = Math.sin(ELAPSED_TIME);
	CubesGroup.rotation.x = Math.cos(ELAPSED_TIME);

	// CAMERA ANIMATION
	// APP.camera.position.x = Math.sin(CURSOR_POS.x * Math.PI * 2) * 5;
	// APP.camera.position.z = Math.cos(CURSOR_POS.x * Math.PI * 2) * 5;
	// APP.camera.position.y = CURSOR_POS.y * 10;
	// APP.camera.lookAt(new THREE.Vector3());

	// UPDATE CONTROL
	APP.control.update();
});
