import GUI from "lil-gui";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import glAmbientLightUrl from "./shaders/includes/ambient-light.glsl?url";
import glPointLightUrl from "./shaders/includes/point-light.glsl?url";
import glDirectionalLightUrl from "./shaders/includes/directional-light.glsl?url";
import glVertexShaderUrl from "./shaders/halftone/vertex.glsl?url";
import glFragmentShaderUrl from "./shaders/halftone/fragment.glsl?url";

// ASSETS
import suzanneGlbUrl from "@/assets/models/suzanne/scene.glb?url";

// LOCAL TYPES
export interface Lesson37ConstructorProps {
	fileLoader?: THREE.FileLoader;
	glTFLoader?: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_37 {
	folderName = "Lesson 37 | Halftone Shading";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	glTFLoader: GLTFLoader;
	configs = {
		uTime: new THREE.Uniform(0),
		uResolution: new THREE.Uniform(
			this.app.renderer.getSize(new THREE.Vector2())
		),
		uColor: new THREE.Uniform(new THREE.Color("#ff794d")),
		uShadowRepetitions: new THREE.Uniform(100),
		uShadowColor: new THREE.Uniform(new THREE.Color("#8e19b8")),
		uLightRepetitions: new THREE.Uniform(130),
		uLightColor: new THREE.Uniform(new THREE.Color("#e5ffe0")),
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson37ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.glTFLoader = props?.glTFLoader ?? new GLTFLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		this.gui?.children.forEach((child) => child.destroy());
		if (this.scene) this.destruct();
		if (this.scene) return;

		this.scene = new THREE.Group();

		// Shaders
		const glAmbientLight = await this.loadFileString(glAmbientLightUrl);
		const glPointLight = await this.loadFileString(glPointLightUrl);
		const glDirectionalLight = await this.loadFileString(glDirectionalLightUrl);
		const vertexShader = await this.loadFileString(glVertexShaderUrl);
		let fragmentShader = await this.loadFileString(glFragmentShaderUrl);

		fragmentShader = fragmentShader
			?.replace("#include <ambientLight>", glAmbientLight ?? "")
			.replace("#include <pointLight>", glPointLight ?? "")
			.replace("#include <directionalLight>", glDirectionalLight ?? "");

		// Material
		const material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: this.configs.uTime,
				uColor: this.configs.uColor,
				uResolution: this.configs.uResolution,
				uShadowRepetitions: this.configs.uShadowRepetitions,
				uShadowColor: this.configs.uShadowColor,
				uLightRepetitions: this.configs.uLightRepetitions,
				uLightColor: this.configs.uLightColor,
			},
		});

		// Objects
		const torusKnot = new THREE.Mesh(
			new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
			material
		);
		torusKnot.position.x = 3;

		// Sphere
		const sphere = new THREE.Mesh(new THREE.SphereGeometry(), material);
		sphere.position.x = -3;

		// Suzanne
		const suzanne = (await this.loadGLTFModel(suzanneGlbUrl))?.scene;
		suzanne?.traverse((child) => {
			if (child instanceof THREE.Mesh) child.material = material;
		});

		// Scene
		if (suzanne) this.scene.add(suzanne);
		this.scene.add(torusKnot, sphere);
		this.app.scene.add(this.scene);

		// Camera
		this.app.camera.position.set(7, 7, 7);

		// Events
		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;
			this.configs.uTime.value = elapsedTime;

			if (suzanne) {
				suzanne.rotation.x = -elapsedTime * 0.1;
				suzanne.rotation.y = elapsedTime * 0.2;
			}

			sphere.rotation.x = -elapsedTime * 0.1;
			sphere.rotation.y = elapsedTime * 0.2;

			torusKnot.rotation.x = -elapsedTime * 0.1;
			torusKnot.rotation.y = elapsedTime * 0.2;

			const pixelRation = this.app.renderer.getPixelRatio();
			this.app.renderer.getSize(this.configs.uResolution.value);
			this.configs.uResolution.value.x *= pixelRation;
			this.configs.uResolution.value.y *= pixelRation;
		});

		this.gui
			?.addColor(
				{ value: `#${this.configs.uColor.value.getHexString()}` },
				"value"
			)
			.onChange((value: string) => this.configs.uColor.value.set(value))
			.name("Color");
		this.gui
			?.add(this.configs.uShadowRepetitions, "value", 1, 300, 1)
			.name("Shadow Repetitions");
		this.gui
			?.addColor(
				{ value: `#${this.configs.uShadowColor.value.getHexString()}` },
				"value"
			)
			.onChange((value: string) => this.configs.uShadowColor.value.set(value))
			.name("Shadow Color");
		this.gui
			?.add(this.configs.uLightRepetitions, "value", 1, 300, 1)
			.name("Light Repetitions");
		this.gui
			?.addColor(
				{ value: `#${this.configs.uLightColor.value.getHexString()}` },
				"value"
			)
			.onChange((value: string) => this.configs.uLightColor.value.set(value))
			.name("Light Color");
		this.gui
			?.add({ function: () => this.destruct() }, "function")
			.name("Destruct");
		this.gui?.open();
		this.gui?.domElement.scrollIntoView({ block: "center" });

		this.onConstruct && this.onConstruct();
	}

	async loadFileString(fileLocation: string) {
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

	async loadGLTFModel(fileLocation: string) {
		return new Promise<GLTF | undefined>((res, rej) => {
			this.glTFLoader.load(
				fileLocation,
				(gltf) => res(gltf),
				undefined,
				() => rej(undefined)
			);
		});
	}

	destruct() {
		if (!this.scene) return;

		this.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose();
				child.material?.dispose();

				for (const key in child.material) {
					const value = child.material[key];

					if (value && typeof value.dispose === "function") {
						value.dispose();
					}
				}
			}
		});

		this.app.scene.remove(this.scene);

		this.scene?.clear();
		this.scene = undefined;

		this.gui?.children.forEach((child, i) => {
			setTimeout(() => child.destroy(), i * 10);
		});
		this.gui
			?.add({ function: () => this.construct() }, "function")
			.name("Construct");

		if (this.app.updateCallbacks[this.folderName])
			delete this.app.updateCallbacks[this.folderName];

		this.onDestruct && this.onDestruct();
	}
}
