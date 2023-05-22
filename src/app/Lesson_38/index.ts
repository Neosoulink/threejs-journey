import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import firefliesVertUrl from "./shaders/fireflies.vert?url";
import firefliesFragUrl from "./shaders/fireflies.frag?url";

// MODELS
import portalModel from "../../assets/models/portal/portal.glb?url";

// TEXTURES
import portalTexture from "../../assets/models/portal/baked.jpg";

// LOCAL TYPES
export interface Lesson32ConstructorProps {
	textureLoader?: THREE.TextureLoader;
	gltfLoader?: GLTFLoader;
	fileLoader?: THREE.FileLoader;
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
	fileLoader: THREE.FileLoader;
	debugObject = {
		renderClearColor: this.app.renderer.getClearColor(new THREE.Color()),
	};
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
		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();

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
			 * Fireflies
			 */
			const firefliesGeometry = new THREE.BufferGeometry();
			const firefliesCount = 30;
			const positionArray = new Float32Array(firefliesCount * 3);

			for (let i = 0; i < firefliesCount; i++) {
				positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
				positionArray[i * 3 + 1] = Math.random() * 1.5;
				positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
			}

			firefliesGeometry.setAttribute(
				"position",
				new THREE.BufferAttribute(positionArray, 3)
			);

			// Material
			/**
			 * Shaders
			 */
			const firefliesVertShader = await this.loadFile(firefliesVertUrl);
			const firefliesFragShader = await this.loadFile(firefliesFragUrl);
			const firefliesMaterial = new THREE.RawShaderMaterial({
				vertexShader: firefliesVertShader,
				fragmentShader: firefliesFragShader,
				uniforms: {
					pixelRation: {
						value: Math.min(this.app.renderer.getPixelRatio(), 2),
					},
				},
			});
			console.log(
				"Math.min(this.app.renderer.pixelRatio, 2) ==>",
				Math.min(this.app.renderer.getPixelRatio(), 2),
				Math.min(window.devicePixelRatio, 2)
			);
			// Points
			const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial);
			this.mainGroup.add(fireflies);

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

			this.app.renderer.setClearColor(this.debugObject.renderClearColor);

			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui?.addColor(this.debugObject, "renderClearColor").onChange(() => {
				this.app.renderer.setClearColor(this.debugObject.renderClearColor);
			});

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

		this.onConstruct && this.onConstruct();
	}

	async loadFile(fileLocation: string) {
		return new Promise<string | undefined>((res, rej) => {
			this.fileLoader.load(
				fileLocation,
				(file) => {
					res(file.toString());
				},
				() => {},
				() => rej(undefined)
			);
		});
	}
}
