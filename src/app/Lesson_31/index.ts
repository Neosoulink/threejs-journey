import GUI from "lil-gui";
import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
// import vertexShaderUrl from "./shaders/vertex.glsl?url";
// import fragmentShaderUrl from "./shaders/fragment.glsl?url";

// ASSETS
import leePerrySmithGlbUrl from "@/assets/models/LeePerrySmith/LeePerrySmith.glb?url";
import leePerrySmithColorImgUrl from "@/assets/models/LeePerrySmith/color.jpg?url";
import leePerrySmithNormalImgUrl from "@/assets/models/LeePerrySmith/normal.jpg?url";

import pxImgUrl from "@/assets/img/textures/environmentMaps/0/px.jpg?url";
import nxImgUrl from "@/assets/img/textures/environmentMaps/0/nx.jpg?url";
import pyImgUrl from "@/assets/img/textures/environmentMaps/0/py.jpg?url";
import nyImgUrl from "@/assets/img/textures/environmentMaps/0/ny.jpg?url";
import pzImgUrl from "@/assets/img/textures/environmentMaps/0/pz.jpg?url";
import nzImgUrl from "@/assets/img/textures/environmentMaps/0/nz.jpg?url";

// LOCAL TYPES
export interface Lesson29ConstructorProps {
	fileLoader?: THREE.FileLoader;
	glTFLoader?: GLTFLoader;
	textureLoader?: THREE.TextureLoader;
	cubeTextureLoader?: THREE.CubeTextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_31 {
	folderName = "Lesson 31 | Modified materials";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	glTFLoader: GLTFLoader;
	textureLoader: THREE.TextureLoader;
	cubeTextureLoader: THREE.CubeTextureLoader;
	vertexShader?: string;
	fragmentShader?: string;
	configs = {
		uTime: { value: 0 },
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson29ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.glTFLoader = props?.glTFLoader ?? new GLTFLoader();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();
		this.cubeTextureLoader =
			props?.cubeTextureLoader ?? new THREE.CubeTextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	private _updateAllMaterials() {
		this.scene?.traverse((child) => {
			if (
				!(child instanceof THREE.Mesh) ||
				!(child.material instanceof THREE.MeshStandardMaterial)
			)
				return;

			child.material.envMapIntensity = 1;
			child.material.needsUpdate = true;
			child.castShadow = true;
			child.receiveShadow = true;
		});
	}

	async construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}
		if (this.scene) this.destruct();
		if (this.scene) return;

		this.scene = new THREE.Group();
		this.gui = this.appGui?.addFolder(this.folderName);

		const clock = new THREE.Clock();

		// Shaders
		// const vertexShader = await this.loadFileString(vertexShaderUrl);
		// const fragmentShader = await this.loadFileString(fragmentShaderUrl);

		// Environment map
		const environmentMap = this.cubeTextureLoader.load([
			pxImgUrl,
			nxImgUrl,
			pyImgUrl,
			nyImgUrl,
			pzImgUrl,
			nzImgUrl,
		]);
		// environmentMap.colorSpace = THREE.SRGBColorSpace;

		// Material
		const mapTexture = this.textureLoader.load(leePerrySmithColorImgUrl);
		mapTexture.colorSpace = THREE.SRGBColorSpace;
		const normalTexture = this.textureLoader.load(leePerrySmithNormalImgUrl);

		const material = new THREE.MeshStandardMaterial({
			map: mapTexture,
			normalMap: normalTexture,
		});

		const depthMaterial = new THREE.MeshDepthMaterial({
			depthPacking: THREE.RGBADepthPacking,
		});

		const shaderHook: (
			shader: THREE.Shader,
			normalSupport?: boolean
		) => void = (shader, normalSupport) => {
			shader.uniforms.uTime = this.configs.uTime;

			shader.vertexShader = shader.vertexShader.replace(
				"#include <clipping_planes_pars_vertex>",
				/* glsl */ `
					#include <clipping_planes_pars_vertex>

					uniform float uTime;

					mat2 get2dRotationMatrix(float _angle) {
						return mat2(
							cos(_angle), -sin(_angle),
							sin(_angle), cos(_angle)
						);
					}
				`
			);

			shader.vertexShader = shader.vertexShader.replace(
				"void main() {",
				"void main() {" +
					/* glsl */ `
					float angle = sin((position.y + uTime)) * 0.4;
					mat2 rotatedMatrix = get2dRotationMatrix(angle);
				`
			);

			if (normalSupport) {
				shader.vertexShader = shader.vertexShader.replace(
					"#include <beginnormal_vertex>",
					/* glsl */ `
						#include <beginnormal_vertex>

						objectNormal.xz = rotatedMatrix * objectNormal.xz;
					`
				);
			}

			shader.vertexShader = shader.vertexShader.replace(
				"#include <begin_vertex>",
				/* glsl */ `
					#include <begin_vertex>

					transformed.xz = rotatedMatrix * transformed.xz;
				`
			);
		};

		material.onBeforeCompile = (shader) => shaderHook(shader, true);
		depthMaterial.onBeforeCompile = (shader) => shaderHook(shader);

		// Model() =>
		const gltfModel = await this.loadGLTFModel(leePerrySmithGlbUrl);
		const mesh = gltfModel?.scene?.children[0];
		if (mesh instanceof THREE.Mesh) {
			mesh.rotation.y = Math.PI * 0.5;
			mesh.material = material;
			mesh.customDepthMaterial = depthMaterial;
			this.scene.add(mesh);
		}

		// Plane
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(15, 15, 15),
			new THREE.MeshStandardMaterial()
		);
		plane.rotation.y = Math.PI;
		plane.position.y = -5;
		plane.position.z = 5;
		this.scene.add(plane);

		this._updateAllMaterials();

		// Lights
		const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.far = 15;
		directionalLight.shadow.normalBias = 0.05;
		directionalLight.position.set(0.25, 2, -2.25);
		this.scene.add(directionalLight);

		// Scene
		this.app.scene.background = environmentMap;
		this.app.scene.environment = environmentMap;
		this.app.scene.add(this.scene);

		// Renderer
		this.app.renderer.shadowMap.enabled = true;
		this.app.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.app.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.app.renderer.toneMappingExposure = 1;

		// Camera
		this.app.camera.position.set(5, 1, -5.5);

		// Events
		this.app.setUpdateCallback(this.folderName, () => {
			this.update(clock.getElapsedTime());
		});

		this.gui
			?.add({ function: () => this.destruct() }, "function")
			.name("Destruct");

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
		this.app.scene.background = null;
		this.app.scene.environment = null;
		this.app.renderer.shadowMap.enabled = false;
		this.app.renderer.toneMapping = THREE.NoToneMapping;

		this.scene?.clear();
		this.scene = undefined;

		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui
			?.add({ function: () => this.construct() }, "function")
			.name("Construct");

		if (this.app.updateCallbacks[this.folderName])
			delete this.app.updateCallbacks[this.folderName];

		this.onDestruct && this.onDestruct();
	}
}
