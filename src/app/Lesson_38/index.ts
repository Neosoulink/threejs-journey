import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// MODELS
import portalModel from "../../assets/models/portal/portal.glb?url";

// TEXTURES
import portalTexture from "../../assets/models/portal/baked.jpg";

// LOCAL TYPES
export interface Lesson32ConstructorProps {
	textureLoader?: THREE.TextureLoader;
	gltfLoader?: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_38 {
	folderName = "Lesson 38 | Importing/optimizing scene";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	clock?: THREE.Clock;
	textureLoader: THREE.TextureLoader;
	gltfLoader: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
	resizeEvent?: () => unknown;

	constructor(props?: Lesson32ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
		this.gui?.close();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();
		this.gltfLoader = props?.gltfLoader ?? new GLTFLoader();

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

			if (this.app.updateCallbacks[this.folderName]) {
				delete this.app.updateCallbacks[this.folderName];
			}

			this.onDestruct && this.onDestruct();
		}
	}

	async construct() {
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
			 * Texture
			 */
			const bakedPortalTexture = this.textureLoader.load(portalTexture);
			bakedPortalTexture.flipY = false;
			bakedPortalTexture.encoding = THREE.sRGBEncoding;

			/**
			 * Material
			 */
			const bakedMaterial = new THREE.MeshBasicMaterial({
				map: bakedPortalTexture,
			});

			const poleLightMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffe5,
			});

			const portalLightMaterial = new THREE.MeshBasicMaterial({
				color: 0xffffff,
			});

			/**
			 * Object
			 */
			this.gltfLoader.load(portalModel, (model) => {
				model.scene.rotateY(Math.PI);
				console.log(model.scene);
				model.scene.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						["poleLightA", "poleLightB"].includes(child.name)
					) {
						child.material = poleLightMaterial;
					} else if (
						child instanceof THREE.Mesh &&
						["portalLight"].includes(child.name)
					) {
						child.material = portalLightMaterial;
					} else if (child instanceof THREE.Mesh) {
						child.material = bakedMaterial;
					}
				});
				this.mainGroup?.add(model.scene);
			});

			/**
			 * Animate
			 */
			// const tick = () => {};

			// this.app.setUpdateCallback(this.folderName, () => {
			// 	tick();
			// });

			this.app.camera.position.x = 4;
			this.app.camera.position.y = 2;
			this.app.camera.position.z = 4;

			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

		this.onConstruct && this.onConstruct();
	}
}
