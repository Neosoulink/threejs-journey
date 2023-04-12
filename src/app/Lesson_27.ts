import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../helpers/ThreeApp";

// LOCAL TYPES
export interface Lesson27ConstructorProps {
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_27 {
	folderName = "Lesson 27 | Shaders";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson27ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	destroy() {
		if (this.mainGroup) {
			this.mainGroup.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.geometry.dispose();

					for (const key in child.material) {
						const value = child.material[key];

						if (value && typeof value.dispose === "function") {
							value.dispose();
						}
					}
				}
			});

			this.app.scene.remove(this.mainGroup);

			this.mainGroup?.clear();
			this.mainGroup = undefined;

			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

			this.onDestruct && this.onDestruct();
		}
	}

	construct() {
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
			 * Textures
			 */
			// const textureLoader = new THREE.TextureLoader();

			/**
			 * Test mesh
			 */
			// Geometry
			const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

			// Material
			const material = new THREE.MeshBasicMaterial();

			// Mesh
			const mesh = new THREE.Mesh(geometry, material);

			this.mainGroup.add(mesh);
			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

		this.onConstruct && this.onConstruct();
	}
}
