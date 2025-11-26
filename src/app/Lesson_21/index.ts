import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// MODELS
import FoxGLTF from "../../assets/models/Fox/glTF/Fox.gltf?url";

export const Lesson_21 = ({
	GLTF_Loader = new GLTFLoader(),
	foxLoadedCallback,
	onConstruct,
	onDestruct,
}: {
	GLTF_Loader: GLTFLoader;
	foxLoadedCallback?: (props: {
		mixer: THREE.AnimationMixer;
		gltf: GLTF;
	}) => unknown;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}) => {
	// DATA
	const app = new ThreeApp();
	const FOLDER_NAME = "Lesson 21 | Imported Models";
	let scene: THREE.Group | undefined;
	let _GUI = app.debug?.ui?.addFolder(FOLDER_NAME);
	_GUI?.close();

	const construct = () => {
		_GUI?.children.forEach((child) => child.destroy());
		if (scene) destroy();
		if (scene) return;
		let foxMixer: THREE.AnimationMixer | undefined;

		scene = new THREE.Group();

		GLTF_Loader.load(FoxGLTF, (gltf) => {
			console.log("gltf loaded ===>", gltf);
			// const _FIXED_GLTF_CHILDREN = [...gltf.scene.children];
			// while (gltf.scene.children.length) {
			// 	APP.scene.add(gltf.scene.children[0]);
			// }
			// for (let i = 0; i < _FIXED_GLTF_CHILDREN.length; i++) {
			// 	APP.scene.add(_FIXED_GLTF_CHILDREN[i]);
			// }

			foxMixer = new THREE.AnimationMixer(gltf.scene);
			foxMixer.clipAction(gltf.animations[0]).play();
			// foxMixer.clipAction(gltf.animations[1]).play();
			// foxMixer.clipAction(gltf.animations[2]).play();

			foxLoadedCallback &&
				foxLoadedCallback({
					mixer: foxMixer,
					gltf,
				});

			gltf.scene.scale.set(0.025, 0.025, 0.025);
			scene?.add(gltf.scene);
		});

		/**
		 * Floor
		 */
		const MODELS_FLOOR = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10),
			new THREE.MeshStandardMaterial({
				color: "#444444",
				metalness: 0,
				roughness: 0.5,
			})
		);
		MODELS_FLOOR.receiveShadow = true;
		MODELS_FLOOR.rotation.x = -Math.PI * 0.5;

		/**
		 * Lights
		 */
		const MODELS_AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.8);

		const MODELS_DIRECTIONAL_LIGHT = new THREE.DirectionalLight(0xffffff, 0.6);
		MODELS_DIRECTIONAL_LIGHT.castShadow = true;
		MODELS_DIRECTIONAL_LIGHT.shadow.mapSize.set(1024, 1024);
		MODELS_DIRECTIONAL_LIGHT.shadow.camera.far = 15;
		MODELS_DIRECTIONAL_LIGHT.shadow.camera.left = -7;
		MODELS_DIRECTIONAL_LIGHT.shadow.camera.top = 7;
		MODELS_DIRECTIONAL_LIGHT.shadow.camera.right = 7;
		MODELS_DIRECTIONAL_LIGHT.shadow.camera.bottom = -7;
		MODELS_DIRECTIONAL_LIGHT.position.set(5, 5, 5);

		scene.add(MODELS_FLOOR, MODELS_AMBIENT_LIGHT, MODELS_DIRECTIONAL_LIGHT);

		app.scene.add(scene);

		_GUI?.add({ function: destroy }, "function").name("Destroy");
		onConstruct && onConstruct();
	};

	const destroy = () => {
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

	_GUI?.add({ function: construct }, "function").name("Enable");

	return {
		destroy,
		construct,
	};
};
