import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import ThreeApp from "@/helpers/ThreeApp";

import HamburgerGLTF from "@/assets/models/hamburger/hamburger.glb?url";

export const lesson_23 = ({
	GLTF_Loader = new GLTFLoader(),
	onConstruct,
	onDestruct,
}: {
	GLTF_Loader: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}) => {
	const app = new ThreeApp();
	const FOLDER_NAME = "Lesson 23 | Custom Model from Blender";
	let scene: THREE.Group | undefined;
	let _GUI = app.debug?.ui?.addFolder(FOLDER_NAME);
	_GUI?.close();

	const construct = () => {
		_GUI?.children.forEach((child) => child.destroy());
		if (scene) destruct();
		if (scene) return;

		scene = new THREE.Group();

		GLTF_Loader.load(HamburgerGLTF, (gltf) => {
			scene?.add(gltf.scene);
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

		scene.add(HAMBURGER_FLOOR);
		scene.add(HAMBURGER_DIRECTIONAL_LIGHT);
		scene.add(HAMBURGER_AMBIENT_LIGHT);

		app.scene.add(scene);

		_GUI?.add({ function: destruct }, "function").name("Destruct");

		onConstruct && onConstruct();
	};

	const destruct = () => {
		if (scene) {
			app.scene.remove(scene);

			scene.clear();
			scene = undefined;

			_GUI?.children.forEach((child, i) =>
				setTimeout(() => child.destroy(), i * 10)
			);
			_GUI?.add({ function: construct }, "function").name("Construct");

			onDestruct && onDestruct();
		}
	};

	_GUI?.add({ function: construct }, "function").name("Construct");

	return {
		destruct,
		construct,
	};
};
