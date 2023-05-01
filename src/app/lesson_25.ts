import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

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

export default ({
	GLTF_Loader = new GLTFLoader(),
	CubeTextureLoader = new THREE.CubeTextureLoader(),
	onConstruct,
	onDestruct,
}: {
	GLTF_Loader: GLTFLoader;
	CubeTextureLoader: THREE.CubeTextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}) => {
	// DATA
	const app = new ThreeApp();
	const FOLDER_NAME = "Lesson 25 | Realistic Renderer";
	let ENVIRONMENT_MAP_TEXTURE: THREE.CubeTexture | undefined;

	let groupContainer: THREE.Group | undefined;
	let _GUI = app.debug?.ui?.addFolder(FOLDER_NAME);
	_GUI?.close();

	const destroy = () => {
		if (groupContainer) {
			app.scene.remove(groupContainer);

			groupContainer.clear();
			groupContainer = undefined;
			if (_GUI) {
				_GUI.destroy();
				_GUI = undefined;
			}

			app.scene.background = null;
			app.scene.environment = null;

			_GUI = app.debug?.ui?.addFolder(FOLDER_NAME);
			_GUI?.add({ function: construct }, "function").name("Enable");

			onDestruct && onDestruct();
		}
	};

	const construct = () => {
		if (_GUI) {
			_GUI.destroy();
			_GUI = undefined;
		}

		if (groupContainer) {
			destroy();
		}

		if (!groupContainer) {
			groupContainer = new THREE.Group();

			// DATA
			const debugObject = { envMapIntensity: 2.5 };

			// FUNCTIONS
			const updateAllChildMeshEnvMap = () => {
				groupContainer?.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						child.material instanceof THREE.MeshStandardMaterial
					) {
						// child.material.envMap = ENVIRONMENT_MAP_TEXTURE;
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
			GLTF_Loader.load(FlightHelmetGLTF, (gltf) => {
				gltf.scene.scale.set(10, 10, 10);
				gltf.scene.position.set(0, -4, 0);
				gltf.scene.rotation.y = Math.PI * 0.5;
				groupContainer?.add(gltf.scene);
				_GUI
					?.add(gltf.scene.rotation, "y")
					.min(-Math.PI)
					.max(Math.PI)
					.step(0.001)
					.name("Helmet Y rotation");
				_GUI
					?.add(debugObject, "envMapIntensity")
					.min(0)
					.max(10)
					.step(0.001)
					.name("Env Map Intensity")
					.onChange(updateAllChildMeshEnvMap);

				_GUI?.add(app.renderer, "toneMapping", {
					No: THREE.NoToneMapping,
					Linear: THREE.LinearToneMapping,
					Reinhard: THREE.ReinhardToneMapping,
					Cineon: THREE.CineonToneMapping,
					ACESFilmic: THREE.ACESFilmicToneMapping,
				});

				_GUI
					?.add(app.renderer, "toneMappingExposure")
					.min(0)
					.max(10)
					.step(0.001);

				updateAllChildMeshEnvMap();
			});

			if (!ENVIRONMENT_MAP_TEXTURE) {
				ENVIRONMENT_MAP_TEXTURE = CubeTextureLoader.load([
					pxEnvImg,
					nxEnvImg,
					pyEnvImg,
					nyEnvImg,
					pzEnvImg,
					nzEnvImg,
				]);

				app.scene.background = ENVIRONMENT_MAP_TEXTURE;
				app.scene.environment = ENVIRONMENT_MAP_TEXTURE;
			}

			groupContainer.add(DIRECTIONAL_LIGHT);
			app.scene.add(groupContainer);

			_GUI = app.debug?.ui?.addFolder(FOLDER_NAME);
			_GUI
				?.add(DIRECTIONAL_LIGHT, "intensity")
				.min(0)
				.max(10)
				.step(0.001)
				.name("LightIntensity");
			_GUI
				?.add(DIRECTIONAL_LIGHT.position, "x")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightX");
			_GUI
				?.add(DIRECTIONAL_LIGHT.position, "y")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightY");
			_GUI
				?.add(DIRECTIONAL_LIGHT.position, "z")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightX");

			_GUI?.add({ function: destroy }, "function").name("Destroy");

			onConstruct && onConstruct();
		}
	};

	_GUI?.add({ function: construct }, "function").name("Enable");

	return {
		destroy,
		construct,
	};
};
