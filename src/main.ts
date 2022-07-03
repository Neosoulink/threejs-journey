// HELPERS
import initThreeJs from "./helpers/initThreeJs";

// COMPONENTS
import Cube from "./components/Cube";

// STYLES
import "./assets/css/style.css";

const APP = initThreeJs();

APP.scene.add(Cube);

APP.camera.position.z = 3;
