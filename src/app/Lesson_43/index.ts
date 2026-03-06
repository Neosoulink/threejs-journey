import * as THREE from "three";
import { GLTFLoader, HDRLoader } from "three/examples/jsm/Addons.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// ASSETS
import envMapUrl from "../../assets/img/textures/aerodynamics_workshop.hdr?url";
import gearsModelUrl from "../../assets/models/gears/gears.glb?url";
import slicedVertexShaderUrl from "./shaders/sliced/vertex.glsl?url";
import slicedFragmentShaderUrl from "./shaders/sliced/fragment.glsl?url";

// LOCAL TYPES
export interface Lesson39ConstructorProps {
	folderName: string;
	fileLoader?: THREE.FileLoader;
	gltfLoader?: GLTFLoader;
	hdrLoader?: HDRLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_43 {
	folderName: string;
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	gltfLoader: GLTFLoader;
	hdrLoader: HDRLoader;
	uniforms = {
		uTime: new THREE.Uniform(0),
		uSliceStart: new THREE.Uniform(1.0),
		uSliceArc: new THREE.Uniform(1.5),
	};
	gearsScene?: THREE.Group;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props: Lesson39ConstructorProps) {
		this.folderName = props.folderName;
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.gltfLoader = props?.gltfLoader ?? new GLTFLoader();
		this.hdrLoader = props?.hdrLoader ?? new HDRLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;

		this.construct();
	}

	async loadFile(fileLocation: string) {
		return (await this.fileLoader.loadAsync(fileLocation)).toString();
	}

	async loadGltfModel(fileLocation: string) {
		return await this.gltfLoader.loadAsync(fileLocation);
	}

	async loadHdrTexture(fileLocation: string) {
		return await this.hdrLoader.loadAsync(fileLocation);
	}

	async construct() {
		this.gui?.children.forEach((child) => child.destroy());
		if (this.scene) this.destruct();
		this.scene = new THREE.Group();

		// Environment Map
		const hdrTexture = await this.loadHdrTexture(envMapUrl);
		hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

		// Shaders
		const vertexShader = await this.loadFile(slicedVertexShaderUrl);
		const fragmentShader = await this.loadFile(slicedFragmentShaderUrl);

		// Materials
		const patchMap = {
			csm_Slice: {
				"#include <colorspace_fragment>": /* glsl */ `
					#include <colorspace_fragment>

					if(!gl_FrontFacing)
							gl_FragColor = vec4(0.75, 0.15, 0.3, 1.0);
				`,
			},
		};

		const material = new THREE.MeshStandardMaterial({
			metalness: 0.5,
			roughness: 0.25,
			envMapIntensity: 0.5,
			color: "#858080",
		});

		const slicedMaterial = new CustomShaderMaterial<
			(typeof THREE)["MeshPhysicalMaterial"]
		>({
			// CSM
			baseMaterial: THREE.MeshPhysicalMaterial,
			vertexShader,
			fragmentShader,
			uniforms: this.uniforms,
			patchMap,

			// Vanilla
			metalness: material.metalness,
			roughness: material.roughness,
			envMapIntensity: material.envMapIntensity,
			color: material.color,
			side: THREE.DoubleSide,
		});

		const slicedDepthMaterial = new CustomShaderMaterial<
			(typeof THREE)["MeshDepthMaterial"]
		>({
			// CSM
			baseMaterial: THREE.MeshDepthMaterial,
			vertexShader,
			fragmentShader,
			uniforms: this.uniforms,
			patchMap,

			// Vanilla
			depthPacking: THREE.RGBADepthPacking,
		});

		// Sliced Geometry
		const { scene: gearsScene } = await this.loadGltfModel(gearsModelUrl);
		this.gearsScene = gearsScene;
		this.gearsScene.traverseVisible((child) => {
			if (child instanceof THREE.Mesh) {
				child.material = material;
				child.castShadow = true;
				child.receiveShadow = true;

				if (child.name === "outerHull") {
					child.material = slicedMaterial;
					child.customDepthMaterial = slicedDepthMaterial;
				}
			}
		});

		// Plane Mesh
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10, 10),
			new THREE.MeshStandardMaterial({ color: "#aaaaaa" }),
		);
		plane.receiveShadow = true;
		plane.position.x = -4;
		plane.position.y = -3;
		plane.position.z = -4;
		plane.lookAt(new THREE.Vector3(0, 0, 0));

		// Lights
		const directionalLight = new THREE.DirectionalLight("#ffffff", 4);
		directionalLight.position.set(6.25, 3, 4);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.near = 0.1;
		directionalLight.shadow.camera.far = 30;
		directionalLight.shadow.normalBias = 0.05;
		directionalLight.shadow.camera.top = 8;
		directionalLight.shadow.camera.right = 8;
		directionalLight.shadow.camera.bottom = -8;
		directionalLight.shadow.camera.left = -8;

		// Scene
		this.scene.add(gearsScene, plane, directionalLight);
		this.app.scene.add(this.scene);
		this.app.scene.background = hdrTexture;
		this.app.scene.backgroundBlurriness = 0.5;
		this.app.scene.environment = hdrTexture;

		// Camera
		this.app.camera.fov = 35;
		this.app.camera.position.set(-5, 5, 12);

		// Renderer
		this.app.renderer.toneMapping = THREE.ACESFilmicToneMapping;

		// Animation
		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;

			this.uniforms.uTime.value = elapsedTime;

			if (this.gearsScene) this.gearsScene.rotation.y = elapsedTime * 0.1;
		});

		// GUI
		this.gui
			?.add(this.uniforms.uSliceStart, "value", -Math.PI, Math.PI, 0.001)
			.name("Slice Start");
		this.gui
			?.add(this.uniforms.uSliceArc, "value", 0, Math.PI * 2, 0.01)
			.name("Slice Arc");
		this.gui
			?.add(
				{
					function: () => {
						this.destruct();
					},
				},
				"function",
			)
			.name("Destruct");
		this.gui?.open();
		this.gui?.domElement.scrollIntoView({ block: "center" });

		this.onConstruct && this.onConstruct();
	}

	destruct() {
		if (!this.scene) return;

		this.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose();

				for (const key in child.material) {
					const value = child.material[key];

					if (value && typeof value.dispose === "function") value.dispose();
				}
			}
		});

		this.app.scene.remove(this.scene);
		this.app.scene.background = null;
		this.app.scene.backgroundBlurriness = 0;
		this.app.scene.environment = null;

		this.scene?.clear();
		this.scene = undefined;

		this.app.camera.fov = 50;
		this.app.camera.position.set(0, 0, 5);

		this.app.renderer.toneMapping = THREE.NoToneMapping;

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
