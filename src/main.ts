// HELPERS
import initThreeJs from "./helpers/initThreeJs";

// COMPONENTS
import Cube from "./components/Cube";

// STYLES
import "./assets/css/style.css";

const APP = initThreeJs({ enableOrbit: true });
const CUBE_CLONE = Cube.clone();
CUBE_CLONE.position.x = -3;

APP.scene.add(Cube);
APP.scene.add(CUBE_CLONE);

APP.camera.position.z = 3;
