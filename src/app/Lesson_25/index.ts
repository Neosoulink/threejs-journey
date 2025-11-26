import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import ThreeApp from "../../helpers/ThreeApp";

import FlightHelmetGLTF from "../../assets/models/FlightHelmet/glTF/FlightHelmet.gltf?url";

import nxEnvImg from "../../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../../assets/img/textures/environmentMaps/0/pz.jpg";

export const Lesson_25 = ({
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
	const app = new ThreeApp();
	const FOLDER_NAME = "Lesson 25 | Realistic Render";
	let environmentMapTexture: THREE.CubeTexture | undefined;

	let mainGroup: THREE.Group | undefined;
	let _GUI = app.debug?.ui?.addFolder(FOLDER_NAME);
	_GUI?.close();

	const construct = () => {
		_GUI?.children.forEach((child) => child.destroy());
		if (mainGroup) destroy();
		if (mainGroup) return;
		mainGroup = new THREE.Group();

		// DATA
		const debugObject = { envMapIntensity: 2.5 };

		// FUNCTIONS
		const updateAllChildMeshEnvMap = () => {
			mainGroup?.traverse((child) => {
				if (
					child instanceof THREE.Mesh &&
					child.material instanceof THREE.MeshStandardMaterial
				) {
					// child.material.envMap = environmentMapTexture;
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
			mainGroup?.add(gltf.scene);
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

			_GUI?.add(app.renderer, "toneMappingExposure").min(0).max(10).step(0.001);

			updateAllChildMeshEnvMap();
		});

		if (!environmentMapTexture)
			environmentMapTexture = CubeTextureLoader.load([
				pxEnvImg,
				nxEnvImg,
				pyEnvImg,
				nyEnvImg,
				pzEnvImg,
				nzEnvImg,
			]);

		app.scene.background = environmentMapTexture;
		app.scene.environment = environmentMapTexture;

		mainGroup.add(DIRECTIONAL_LIGHT);
		app.scene.add(mainGroup);

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
	};

	const destroy = () => {
		if (mainGroup) {
			app.scene.remove(mainGroup);

			mainGroup.clear();
			mainGroup = undefined;
		}

		app.scene.background = null;
		app.scene.environment = null;

		_GUI?.children.forEach((child, i) =>
			setTimeout(() => child.destroy(), i * 10)
		);
		_GUI?.add({ function: construct }, "function").name("Construct");

		onDestruct && onDestruct();
	};

	_GUI?.add({ function: construct }, "function").name("Enable");

	return {
		destroy,
		construct,
	};
};
