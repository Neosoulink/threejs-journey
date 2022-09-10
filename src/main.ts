import * as THREE from "three";
// import GSAP from "gsap";

// HELPERS
import initThreeJs from "./helpers/initThreeJs";
// COMPONENTS
import Cube from "./components/Cube";

// STYLES
import "./assets/css/style.css";

const CUBE_CLONE = Cube.clone();

const CUBES_GROUP = new THREE.Group();
// let savedTime = Date.now();

// SCALES
Cube.scale.set(0.5, 0.5, 0.5);

// POSITIONS
Cube.position.set(0, 0, 0);
CUBE_CLONE.position.set(-3, -1, 0);

// ROTATIONS
Cube.rotation.reorder("YXZ");
Cube.rotation.set(Math.PI / 5, 3, 3);
CUBE_CLONE.rotation.set(Math.PI / 2, -1, 0, "YXZ");
// CUBES_GROUP.rotation.z = 3;

// GROUPE
CUBES_GROUP.add(Cube, CUBE_CLONE);

// CLOCK
const ANIMATION_CLOCK = new THREE.Clock();

const APP = initThreeJs({
	// enableOrbit: true,
	axesSizes: 5,
});

APP.scene.add(CUBES_GROUP);

//
APP.camera.position.z = 10;

// GSAP
// GSAP.to(CUBES_GROUP.position, { duration: 0.2, delay: 1, x: 1 });
// GSAP.to(CUBES_GROUP.position, { duration: 0.2, delay: 2, x: 0 });

// CURSOR ANIMATION
const CURSOR_POS = {
	x: 0,
	y: 0,
};
window.addEventListener("mousemove", (e) => {
	CURSOR_POS.x = e.clientX / APP.sceneSizes.width - 0.5;
	CURSOR_POS.y = e.clientY / APP.sceneSizes.height - 0.5;
});

APP.animate(() => {
	// Animation using native js date
	// const CURRENT_TIME = Date.now();
	// const DELTA_TIME = CURRENT_TIME - savedTime;
	// savedTime = CURRENT_TIME;

	// ANIMATION using THREE clock
	const ELAPSED_TIME = ANIMATION_CLOCK.getElapsedTime();
	CUBES_GROUP.rotation.y = Math.sin(ELAPSED_TIME);
	CUBES_GROUP.rotation.x = Math.cos(ELAPSED_TIME);

	// CAMERA ANIMATION
	APP.camera.position.x = Math.sin(CURSOR_POS.x * Math.PI * 2) * 5;
	APP.camera.position.z = Math.cos(CURSOR_POS.x * Math.PI * 2) * 5;
	APP.camera.position.y = CURSOR_POS.y * 10;
	APP.camera.lookAt(new THREE.Vector3());
});
