import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// MODELS
import damagedHelmetGLTF from "../../assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf?url";

// TEXTURES
import nxEnvImg from "../../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../../assets/img/textures/environmentMaps/0/pz.jpg";

// LOCAL TYPES
export interface Lesson32ConstructorProps {
	GLTFLoader?: GLTFLoader;
	cubeTextureLoader?: THREE.CubeTextureLoader;
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_32 {
	folderName = "Lesson 32 | Postprocessing";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	gltfLoader: GLTFLoader;
	cubeTextureLoader: THREE.CubeTextureLoader;
	textureLoader: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson32ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

		this.gltfLoader = props?.GLTFLoader ?? new GLTFLoader();
		this.cubeTextureLoader =
			props?.cubeTextureLoader ?? new THREE.CubeTextureLoader();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

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

			this.app.scene.background = null;
			this.app.scene.environment = null;

			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

			this.app.renderer.toneMapping = THREE.CineonToneMapping;

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

			// FUNCTIONS
			const updateAllChildMeshEnvMap = () => {
				this.mainGroup?.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						child.material instanceof THREE.MeshStandardMaterial
					) {
						child.material.envMapIntensity = 2.5;
						child.material.needsUpdate = true;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
			};

			const environmentMap = this.cubeTextureLoader.load([
				pxEnvImg,
				nxEnvImg,
				pyEnvImg,
				nyEnvImg,
				pzEnvImg,
				nzEnvImg,
			]);
			environmentMap.encoding = THREE.sRGBEncoding;

			this.app.scene.background = environmentMap;
			this.app.scene.environment = environmentMap;

			/**
			 * Models
			 */
			this.gltfLoader.load(damagedHelmetGLTF, (gltf) => {
				gltf.scene.scale.set(2, 2, 2);
				gltf.scene.rotation.y = Math.PI * 0.5;
				this.app.scene.add(gltf.scene);

				updateAllChildMeshEnvMap();
			});

			/**
			 * Lights
			 */
			const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
			directionalLight.castShadow = true;
			directionalLight.shadow.mapSize.set(1024, 1024);
			directionalLight.shadow.camera.far = 15;
			directionalLight.shadow.normalBias = 0.05;
			directionalLight.position.set(0.25, 3, -2.25);
			this.app.scene.add(directionalLight);

			/**
			 * Sizes
			 */
			const sizes = {
				width: window.innerWidth,
				height: window.innerHeight,
			};

			window.addEventListener("resize", () => {
				// Update sizes
				sizes.width = window.innerWidth;
				sizes.height = window.innerHeight;

				// Update camera
				this.app.camera.aspect = sizes.width / sizes.height;
				this.app.camera.updateProjectionMatrix();

				// Update renderer
				this.app.renderer.setSize(sizes.width, sizes.height);
				this.app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			});

			this.app.renderer.toneMapping = THREE.ReinhardToneMapping;

			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

		this.app.setUpdateCallback(this.folderName, () => {
			this.update();
		});

		this.onConstruct && this.onConstruct();
	}

	update() {}
}
