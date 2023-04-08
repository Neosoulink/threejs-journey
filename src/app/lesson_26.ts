import * as THREE from "three";
import { GUI } from "lil-gui";
import Cannon from "cannon";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// HELPERS
import initThreeJs from "../helpers/threejs/initThreeJs";

// MODELS
import FoxGLTF from "../assets/models/Fox/glTF/Fox.gltf?url";

// TEXTURES
import nxEnvImg from "../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../assets/img/textures/environmentMaps/0/pz.jpg";
import dirtColorImg from "../assets/imG/textures/dirt/color.jpg";
import dirtNormalImg from "../assets/imG/textures/dirt/normal.jpg";

// LOCAL TYPES
export interface ConstructorProps {
	app: ReturnType<typeof initThreeJs>;
	appGui: GUI;
	textureLoader?: THREE.TextureLoader;
	cubeTextureLoader?: THREE.CubeTextureLoader;
	gltfLoader?: GLTFLoader;
	onConstruct?: (formsPhysic: {
		worldInstance: Cannon.World;
		spheres: {
			mesh: THREE.Mesh;
			body: Cannon.Body;
		}[];
		boxes: {
			mesh: THREE.Mesh;
			body: Cannon.Body;
		}[];
	}) => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_26 {
	// PROPS
	folderName = "Lesson 26 | Class integartion";
	groupContainer?: THREE.Group;
	debugObject: { envMapIntensity?: number } = {};
	foxMixer?: THREE.AnimationMixer;
	environmentMap?: THREE.CubeTexture;
	app: ConstructorProps["app"];
	appGui: ConstructorProps["appGui"];
	gui?: ConstructorProps["appGui"];
	textureLoader: ConstructorProps["textureLoader"];
	cubeTextureLoader: ConstructorProps["cubeTextureLoader"];
	gltfLoader: ConstructorProps["gltfLoader"];
	onDestruct?: ConstructorProps["onDestruct"];

	constructor({
		app,
		appGui,
		gltfLoader = new GLTFLoader(),
		textureLoader = new THREE.TextureLoader(),
		cubeTextureLoader = new THREE.CubeTextureLoader(),
		onDestruct,
	}: ConstructorProps) {
		this.app = app;
		this.appGui = appGui;
		this.gui = appGui.addFolder(this.folderName);
		this.gui
			.add({ function: () => this.construct(this) }, "function")
			.name("Enable");
		this.cubeTextureLoader = cubeTextureLoader;
		this.gltfLoader = gltfLoader;
		this.textureLoader = textureLoader;
		this.onDestruct = onDestruct;
	}

	destroy(self: Lesson_26) {
		if (self.groupContainer) {
			self.app.scene.remove(self.groupContainer);

			self.groupContainer?.clear();
			self.groupContainer = undefined;

			if (self.gui) {
				self.gui.destroy();
				self.gui = undefined;
			}

			self.gui = self.appGui.addFolder(self.folderName);
			self.gui
				.add({ function: () => self.construct(self) }, "function")
				.name("Enable");

			self.onDestruct && self.onDestruct();
		}
	}

	construct(self: Lesson_26 = this) {
		if (self.gui) {
			self.gui.destroy();
			self.gui = undefined;
		}

		if (self.groupContainer) {
			self.destroy(self);
		}

		if (!self.environmentMap) {
			self.environmentMap = self.cubeTextureLoader?.load([
				pxEnvImg,
				nxEnvImg,
				pyEnvImg,
				nyEnvImg,
				pzEnvImg,
				nzEnvImg,
			]);

			if (self.environmentMap) {
				self.environmentMap.encoding = THREE.sRGBEncoding;
				self.app.scene.environment = self.environmentMap;
			}
		}

		if (
			!self.groupContainer &&
			self.environmentMap &&
			self.cubeTextureLoader &&
			self.textureLoader
		) {
			self.groupContainer = new THREE.Group();

			// scene.background = environmentMap
			self.app.scene.environment = self.environmentMap;

			/**
			 * Models
			 */

			self.gltfLoader?.load(FoxGLTF, (gltf) => {
				// Model
				gltf.scene.scale.set(0.02, 0.02, 0.02);
				self.groupContainer?.add(gltf.scene);

				// Animation
				self.foxMixer = new THREE.AnimationMixer(gltf.scene);
				const foxAction = self.foxMixer.clipAction(gltf.animations[0]);
				foxAction.play();

				// Update materials
				self.updateAllMaterials(self);
				self.groupContainer?.add(gltf.scene);
			});

			/**
			 * Floor
			 */
			const floorColorTexture = self.textureLoader.load(dirtColorImg);
			floorColorTexture.encoding = THREE.sRGBEncoding;
			floorColorTexture.repeat.set(1.5, 1.5);
			floorColorTexture.wrapS = THREE.RepeatWrapping;
			floorColorTexture.wrapT = THREE.RepeatWrapping;

			const floorNormalTexture = self.textureLoader.load(dirtNormalImg);
			floorNormalTexture.repeat.set(1.5, 1.5);
			floorNormalTexture.wrapS = THREE.RepeatWrapping;
			floorNormalTexture.wrapT = THREE.RepeatWrapping;

			const floorGeometry = new THREE.CircleGeometry(5, 64);
			const floorMaterial = new THREE.MeshStandardMaterial({
				map: floorColorTexture,
				normalMap: floorNormalTexture,
			});
			const floor = new THREE.Mesh(floorGeometry, floorMaterial);
			floor.rotation.x = -Math.PI * 0.5;

			/**
			 * Lights
			 */
			const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
			directionalLight.castShadow = true;
			directionalLight.shadow.camera.far = 15;
			directionalLight.shadow.mapSize.set(1024, 1024);
			directionalLight.shadow.normalBias = 0.05;
			directionalLight.position.set(3.5, 2, -1.25);

			self.app.renderer.physicallyCorrectLights = true;
			self.app.renderer.outputEncoding = THREE.sRGBEncoding;
			self.app.renderer.toneMapping = THREE.CineonToneMapping;
			self.app.renderer.toneMappingExposure = 1.75;
			self.app.renderer.shadowMap.enabled = true;
			self.app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			self.app.renderer.setClearColor("#211d20");

			self.groupContainer.add(floor, directionalLight);

			self.app.scene.add(self.groupContainer);

			self.debugObject.envMapIntensity = 0.4;
			self.gui = self.appGui?.addFolder(self.folderName);
			self.gui
				.add(self.debugObject, "envMapIntensity")
				.min(0)
				.max(4)
				.step(0.001)
				.onChange(() => self.updateAllMaterials(self));

			self.gui
				.add(directionalLight, "intensity")
				.min(0)
				.max(10)
				.step(0.001)
				.name("lightIntensity");
			self.gui
				.add(directionalLight.position, "x")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("lightX");
			self.gui
				.add(directionalLight.position, "y")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("lightY");
			self.gui
				.add(directionalLight.position, "z")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("lightZ");
			self.gui
				.add({ function: () => self.destroy(self) }, "function")
				.name("Destroy");
		}
	}

	updateAllMaterials(self: Lesson_26) {
		self.groupContainer?.traverse((child) => {
			if (
				child instanceof THREE.Mesh &&
				child.material instanceof THREE.MeshStandardMaterial
			) {
				// child.material.envMap = environmentMap
				child.material.envMapIntensity = self.debugObject.envMapIntensity ?? 0;
				child.material.needsUpdate = true;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}
}
