import * as THREE from "three";

// HELPERS
import initThreeJs from "./helpers/initThreeJs";
// COMPONENTS
import Cube from "./components/Cube";

// STYLES
import "./assets/css/style.css";

const APP = initThreeJs({ enableOrbit: true });
const CUBE_CLONE = Cube.clone();
const AXES_HELPER = new THREE.AxesHelper(5);

Cube.scale.set(0.5, 0.5, 0.5);
Cube.position.set(2, 0, 0);
CUBE_CLONE.position.set(-3, -1, 0);

APP.scene.add(Cube);
APP.scene.add(CUBE_CLONE);
APP.scene.add(AXES_HELPER);

APP.camera.position.z = 3;
