import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "lil-gui";

// HELPERS
import initThreeJs from "../helpers/initThreeJs";

// MODELS
import HamburgerGLTF from "../assets/models/hamburger/hamburger.glb?url";

/* REALISTIC MODELS */
export default ({
	app,
	appGui,
	GLTF_Loader = new GLTFLoader(),
	onConstruct,
	onDestruct,
}: {
	app: ReturnType<typeof initThreeJs>;
	appGui: GUI;
	GLTF_Loader: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}) => {
	// DATA
	const FOLDER_NAME = "Lesson 24 | Custom Model from Blender";
	let groupContainer: THREE.Group | undefined;
	let _GUI: typeof appGui | undefined = appGui.addFolder(FOLDER_NAME);

	const destroy = () => {
		if (groupContainer) {
			app.scene.remove(groupContainer);

			groupContainer.clear();
			groupContainer = undefined;
			if (_GUI) {
				_GUI.destroy();
				_GUI = undefined;
			}

			_GUI = appGui.addFolder(FOLDER_NAME);
			_GUI.add({ function: construct }, "function").name("Enable");

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

			GLTF_Loader.load(HamburgerGLTF, (gltf) => {
				groupContainer?.add(gltf.scene);
			});

			/**
			 * Floor
			 */
			const HAMBURGER_FLOOR = new THREE.Mesh(
				new THREE.PlaneGeometry(50, 50),
				new THREE.MeshStandardMaterial({
					color: "#444444",
					metalness: 0,
					roughness: 0.5,
				})
			);

			HAMBURGER_FLOOR.receiveShadow = true;
			HAMBURGER_FLOOR.rotation.x = -Math.PI * 0.5;

			/**
			 * Lights
			 */
			const HAMBURGER_AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.8);
			const HAMBURGER_DIRECTIONAL_LIGHT = new THREE.DirectionalLight(
				0xffffff,
				0.6
			);
			HAMBURGER_DIRECTIONAL_LIGHT.castShadow = true;
			HAMBURGER_DIRECTIONAL_LIGHT.shadow.mapSize.set(1024, 1024);
			HAMBURGER_DIRECTIONAL_LIGHT.shadow.camera.far = 15;
			HAMBURGER_DIRECTIONAL_LIGHT.shadow.camera.left = -7;
			HAMBURGER_DIRECTIONAL_LIGHT.shadow.camera.top = 7;
			HAMBURGER_DIRECTIONAL_LIGHT.shadow.camera.right = 7;
			HAMBURGER_DIRECTIONAL_LIGHT.shadow.camera.bottom = -7;
			HAMBURGER_DIRECTIONAL_LIGHT.position.set(5, 5, 5);

			groupContainer.add(HAMBURGER_FLOOR);
			groupContainer.add(HAMBURGER_DIRECTIONAL_LIGHT);
			groupContainer.add(HAMBURGER_AMBIENT_LIGHT);

			app.scene.add(groupContainer);

			_GUI = appGui.addFolder(FOLDER_NAME);
			_GUI.add({ function: destroy }, "function").name("Destroy");

			onConstruct && onConstruct();
		}
	};

	_GUI.add({ function: construct }, "function").name("Enable");

	return {
		destroy,
		construct,
	};
};
