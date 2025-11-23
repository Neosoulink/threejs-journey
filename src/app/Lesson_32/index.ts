import GUI from "lil-gui";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import vertexShaderUrl from "./shaders/vertex.glsl?url";
import fragmentShaderUrl from "./shaders/fragment.glsl?url";

// ASSETS
import modelGlbUrl from "@/assets/models/coffee/scene.glb?url";
import perlinTextureUrl from "@/assets/img/textures/perlin.png?url";

// LOCAL TYPES
export interface Lesson32ConstructorProps {
	fileLoader?: THREE.FileLoader;
	glTFLoader?: GLTFLoader;
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_32 {
	folderName = "Lesson 32 | Coffee Smoke";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	glTFLoader: GLTFLoader;
	textureLoader: THREE.TextureLoader;
	configs = {
		uTime: new THREE.Uniform(0),
		uPerlinTexture: new THREE.Uniform<null | THREE.Texture>(null),
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson32ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.glTFLoader = props?.glTFLoader ?? new GLTFLoader();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		this.gui?.children.forEach((child) => {
			child.destroy();
		});
		if (this.scene) this.destruct();
		if (this.scene) return;

		this.scene = new THREE.Group();

		// Shaders
		const vertexShader = await this.loadFileString(vertexShaderUrl);
		const fragmentShader = await this.loadFileString(fragmentShaderUrl);

		// Textures
		this.configs.uPerlinTexture.value =
			this.textureLoader.load(perlinTextureUrl);
		const perlinTexture = this.configs.uPerlinTexture.value;
		perlinTexture.wrapS = THREE.RepeatWrapping;
		perlinTexture.wrapT = THREE.RepeatWrapping;

		// Material
		const gltfModel = await this.loadGLTFModel(modelGlbUrl);
		const model = gltfModel?.scene;
		const modelMaterial = (model?.getObjectByName("baked") as THREE.Mesh)
			?.material;
		if (modelMaterial instanceof THREE.MeshBasicMaterial && modelMaterial.map)
			modelMaterial.map.anisotropy = 8;
		if (model instanceof THREE.Object3D) this.scene.add(model);

		// Smoke
		const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64);
		smokeGeometry.translate(0, 0.5, 0);
		smokeGeometry.scale(1.5, 6, 1.5);

		const smokeMaterial = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			// wireframe: true,
			side: THREE.DoubleSide,
			transparent: true,
			depthWrite: false,
			uniforms: {
				uTime: this.configs.uTime,
				uPerlinTexture: this.configs.uPerlinTexture,
			},
		});

		const smokeMesh = new THREE.Mesh(smokeGeometry, smokeMaterial);
		smokeMesh.position.y = 1.83;

		// Scene
		this.scene.add(smokeMesh);
		this.app.scene.add(this.scene);

		// Camera
		this.app.camera.position.set(8, 10, 12);

		// Events
		this.app.setUpdateCallback(this.folderName, () => {
			this.update(this.app.time.elapsed * 0.01);
		});

		this.gui
			?.add({ function: () => this.destruct() }, "function")
			.name("Destruct");
		this.gui?.open();

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

	update(elapsedTime: number) {
		this.configs.uTime.value = elapsedTime;
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

		this.gui?.children.forEach((child) => {
			child.destroy();
		});
		this.gui
			?.add({ function: () => this.construct() }, "function")
			.name("Construct");

		if (this.app.updateCallbacks[this.folderName])
			delete this.app.updateCallbacks[this.folderName];

		this.onDestruct && this.onDestruct();
	}
}
