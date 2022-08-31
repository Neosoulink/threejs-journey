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
const CUBES_GROUP = new THREE.Group();

// SCALES
Cube.scale.set(0.5, 0.5, 0.5);

// POSITIONS
Cube.position.set(2, 0, 0);
CUBE_CLONE.position.set(-3, -1, 0);

// ROTATIONS
Cube.rotation.reorder("YXZ");
Cube.rotation.set(Math.PI / 5, 3, 3);
CUBE_CLONE.rotation.set(Math.PI / 2, -1, 0, "YXZ");
CUBES_GROUP.rotation.z = 3;

//
CUBES_GROUP.add(Cube, CUBE_CLONE);
APP.scene.add(AXES_HELPER);
APP.scene.add(CUBES_GROUP);

//
APP.camera.position.z = 10;
APP.camera.lookAt(CUBES_GROUP.position);
