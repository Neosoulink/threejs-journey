import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../helpers/ThreeApp";

export interface Lesson25Props {
	GLTF_Loader?: GLTFLoader;
	CubeTextureLoader?: THREE.CubeTextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

class Lesson_25_Env {
	folderName = "Lesson 25 | Environment map";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props: Lesson25Props) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
		this.gui?.close();
		this.onConstruct = props?.onConstruct;
		this.onDestruct = props?.onDestruct;
	}

	destroy = () => {
		if (this.mainGroup) {
			this.app.scene.remove(this.mainGroup);

			this.mainGroup.clear();
			this.mainGroup = undefined;
			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.app.scene.background = null;
			this.app.scene.environment = null;

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

			this.onDestruct && this.onDestruct();
		}
	};

	construct = () => {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.mainGroup) {
			this.destroy();
		}

		if (!this.mainGroup) {
			this.mainGroup = new THREE.Group();

			/**
			 * Torus Knot
			 */
			const TORUS_KNOT = new THREE.Mesh(
				new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
				new THREE.MeshBasicMaterial()
			);
			TORUS_KNOT.position.y = 4;

			this.mainGroup.add(TORUS_KNOT);
			this.app.scene.add(this.mainGroup);

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");

			this.onConstruct && this.onConstruct();

			this.app.camera.position.set(4, 5, 4);
			if (this.app.control) this.app.control.target.y = 3.5;
		}
	};
}
export default Lesson_25_Env;
