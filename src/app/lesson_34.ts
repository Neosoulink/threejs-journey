import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../helpers/ThreeApp";

// MODELS
import FlightHelmetGLTF from "../assets/models/FlightHelmet/glTF/FlightHelmet.gltf?url";

// TEXTURES
import nxEnvImg from "../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../assets/img/textures/environmentMaps/0/pz.jpg";

export default class Lesson_34 {
	// DATA
	app = new ThreeApp();
	folderName = "Lesson 34 | Intro and Loading progress";
	environmentMapTexture?: THREE.CubeTexture;
	groupContainer?: THREE.Group;
	gui?: GUI;
	GLTF_Loader: GLTFLoader;
	CubeTextureLoader: THREE.CubeTextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor({
		GLTF_Loader = new GLTFLoader(),
		CubeTextureLoader = new THREE.CubeTextureLoader(),
		onConstruct,
		onDestruct,
	}: {
		GLTF_Loader?: GLTFLoader;
		CubeTextureLoader?: THREE.CubeTextureLoader;
		onConstruct?: () => unknown;
		onDestruct?: () => unknown;
	}) {
		this.GLTF_Loader = GLTF_Loader;
		this.CubeTextureLoader = CubeTextureLoader;
		this.onConstruct = onConstruct;
		this.onDestruct = onDestruct;

		this.gui = this.app.debug?.ui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
	}

	destroy() {
		if (this.groupContainer) {
			this.app.scene.remove(this.groupContainer);

			this.groupContainer.clear();
			this.groupContainer = undefined;
			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			if (this.environmentMapTexture) {
				this.environmentMapTexture.dispose();
				this.environmentMapTexture = undefined;
			}

			this.app.scene.background = null;
			this.app.scene.environment = null;

			this.app.renderer.toneMapping = THREE.CineonToneMapping;
			this.app.renderer.toneMappingExposure = 1.75;

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

			this.onDestruct && this.onDestruct();
		}
	}

	construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.groupContainer) {
			this.destroy();
		}

		if (!this.groupContainer) {
			this.groupContainer = new THREE.Group();

			// DATA
			const debugObject = { envMapIntensity: 2.5 };

			// FUNCTIONS
			const updateAllChildMeshEnvMap = () => {
				this.groupContainer?.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						child.material instanceof THREE.MeshStandardMaterial
					) {
						// child.material.envMap = this.environmentMapTexture;
						child.material.envMapIntensity = debugObject.envMapIntensity;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
			};

			// LIGHTS
			const DIRECTIONAL_LIGHT = new THREE.DirectionalLight("#ffffff", 3);
			DIRECTIONAL_LIGHT.position.set(0.25, 3, -2.25);
			DIRECTIONAL_LIGHT.castShadow = true;
			DIRECTIONAL_LIGHT.shadow.camera.far = 15;
			DIRECTIONAL_LIGHT.shadow.mapSize.set(1024, 1024);
			DIRECTIONAL_LIGHT.shadow.normalBias = 0.05;

			// MODELS
			this.GLTF_Loader.load(FlightHelmetGLTF, (gltf) => {
				gltf.scene.scale.set(10, 10, 10);
				gltf.scene.position.set(0, -4, 0);
				gltf.scene.rotation.y = Math.PI * 0.5;
				this.groupContainer?.add(gltf.scene);
				this.gui
					?.add(gltf.scene.rotation, "y")
					.min(-Math.PI)
					.max(Math.PI)
					.step(0.001)
					.name("Helmet Y rotation");
				this.gui
					?.add(debugObject, "envMapIntensity")
					.min(0)
					.max(10)
					.step(0.001)
					.name("Env Map Intensity")
					.onChange(updateAllChildMeshEnvMap);

				this.gui?.add(this.app.renderer, "toneMapping", {
					No: THREE.NoToneMapping,
					Linear: THREE.LinearToneMapping,
					Reinhard: THREE.ReinhardToneMapping,
					Cineon: THREE.CineonToneMapping,
					ACESFilmic: THREE.ACESFilmicToneMapping,
				});

				this.gui
					?.add(this.app.renderer, "toneMappingExposure")
					.min(0)
					.max(10)
					.step(0.001);

				updateAllChildMeshEnvMap();
			});

			if (!this.environmentMapTexture) {
				this.environmentMapTexture = this.CubeTextureLoader.load([
					pxEnvImg,
					nxEnvImg,
					pyEnvImg,
					nyEnvImg,
					pzEnvImg,
					nzEnvImg,
				]);

				this.app.scene.background = this.environmentMapTexture;
				this.app.scene.environment = this.environmentMapTexture;
			}

			this.app.renderer.toneMapping = THREE.ReinhardToneMapping;
			this.app.renderer.toneMappingExposure = 3;

			this.groupContainer.add(DIRECTIONAL_LIGHT);
			this.app.scene.add(this.groupContainer);

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui
				?.add(DIRECTIONAL_LIGHT, "intensity")
				.min(0)
				.max(10)
				.step(0.001)
				.name("LightIntensity");
			this.gui
				?.add(DIRECTIONAL_LIGHT.position, "x")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightX");
			this.gui
				?.add(DIRECTIONAL_LIGHT.position, "y")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightY");
			this.gui
				?.add(DIRECTIONAL_LIGHT.position, "z")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightX");

			this.gui?.add({ fn: () => this.destroy() }, "fn").name("Destroy");

			this.onConstruct && this.onConstruct();
		}
	}
}
