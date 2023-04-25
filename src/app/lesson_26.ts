import * as THREE from "three";
import Cannon from "cannon";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// HELPERS
import ThreeApp from "../helpers/ThreeApp";

// MODELS
import FoxGLTF from "../assets/models/Fox/glTF/Fox.gltf?url";

// TEXTURES
import nxEnvImg from "../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../assets/img/textures/environmentMaps/0/pz.jpg";
import dirtColorImg from "../assets/img/textures/dirt/color.jpg";
import dirtNormalImg from "../assets/img/textures/dirt/normal.jpg";

// LOCAL TYPES
export interface ConstructorProps {
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
	folderName = "Lesson 26 | Class integration";
	groupContainer?: THREE.Group;
	debugObject: { envMapIntensity?: number } = {};
	foxMixer?: THREE.AnimationMixer;
	environmentMap?: THREE.CubeTexture;
	app = new ThreeApp();
	appGui = this.app.debug?.ui;
	gui?: typeof this.appGui;
	textureLoader: ConstructorProps["textureLoader"];
	cubeTextureLoader: ConstructorProps["cubeTextureLoader"];
	gltfLoader: ConstructorProps["gltfLoader"];
	onDestruct?: ConstructorProps["onDestruct"];

	constructor({
		gltfLoader = new GLTFLoader(),
		textureLoader = new THREE.TextureLoader(),
		cubeTextureLoader = new THREE.CubeTextureLoader(),
		onDestruct,
	}: ConstructorProps) {
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui
			?.add({ function: () => this.construct() }, "function")
			.name("Enable");
		this.cubeTextureLoader = cubeTextureLoader;
		this.gltfLoader = gltfLoader;
		this.textureLoader = textureLoader;
		this.onDestruct = onDestruct;


	}

	destroy() {
		if (this.groupContainer) {
			this.app.scene.remove(this.groupContainer);

			this.groupContainer?.clear();
			this.groupContainer = undefined;

			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

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

		if (!this.environmentMap) {
			this.environmentMap = this.cubeTextureLoader?.load([
				pxEnvImg,
				nxEnvImg,
				pyEnvImg,
				nyEnvImg,
				pzEnvImg,
				nzEnvImg,
			]);

			if (this.environmentMap) {
				this.environmentMap.encoding = THREE.sRGBEncoding;
				this.app.scene.environment = this.environmentMap;
			}
		}

		if (
			!this.groupContainer &&
			this.environmentMap &&
			this.cubeTextureLoader &&
			this.textureLoader
		) {
			this.groupContainer = new THREE.Group();

			// scene.background = environmentMap
			this.app.scene.environment = this.environmentMap;

			/**
			 * Models
			 */

			this.gltfLoader?.load(FoxGLTF, (gltf) => {
				// Model
				gltf.scene.scale.set(0.02, 0.02, 0.02);
				this.groupContainer?.add(gltf.scene);

				// Animation
				this.foxMixer = new THREE.AnimationMixer(gltf.scene);
				const foxAction = this.foxMixer.clipAction(gltf.animations[0]);
				foxAction.play();

				// Update materials
				this.updateAllMaterials();
				this.groupContainer?.add(gltf.scene);
			});

			/**
			 * Floor
			 */
			const floorColorTexture = this.textureLoader.load(dirtColorImg);
			floorColorTexture.encoding = THREE.sRGBEncoding;
			floorColorTexture.repeat.set(1.5, 1.5);
			floorColorTexture.wrapS = THREE.RepeatWrapping;
			floorColorTexture.wrapT = THREE.RepeatWrapping;

			const floorNormalTexture = this.textureLoader.load(dirtNormalImg);
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

			this.app.renderer.physicallyCorrectLights = true;
			this.app.renderer.outputEncoding = THREE.sRGBEncoding;
			this.app.renderer.toneMapping = THREE.CineonToneMapping;
			this.app.renderer.toneMappingExposure = 1.75;
			this.app.renderer.shadowMap.enabled = true;
			this.app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			this.app.renderer.setClearColor("#211d20");

			this.groupContainer.add(floor, directionalLight);

			this.app.scene.add(this.groupContainer);

			this.debugObject.envMapIntensity = 0.4;
			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add(this.debugObject, "envMapIntensity")
				.min(0)
				.max(4)
				.step(0.001)
				.onChange(() => this.updateAllMaterials());

			this.gui
				?.add(directionalLight, "intensity")
				.min(0)
				.max(10)
				.step(0.001)
				.name("lightIntensity");
			this.gui
				?.add(directionalLight.position, "x")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("lightX");
			this.gui
				?.add(directionalLight.position, "y")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("lightY");
			this.gui
				?.add(directionalLight.position, "z")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("lightZ");
			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}
	}

	updateAllMaterials(this: Lesson_26) {
		this.groupContainer?.traverse((child) => {
			if (
				child instanceof THREE.Mesh &&
				child.material instanceof THREE.MeshStandardMaterial
			) {
				// child.material.envMap = environmentMap
				child.material.envMapIntensity = this.debugObject.envMapIntensity ?? 0;
				child.material.needsUpdate = true;
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}
}
