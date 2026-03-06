import * as THREE from "three";
import { GLTFLoader, HDRLoader } from "three/examples/jsm/Addons.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// ASSETS
import urbanAllayTextureUrl from "../../assets/img/textures/urban_alley_01_1k.hdr?url";
import suzanneModelUrl from "../../assets/models/suzanne/smooth.glb?url";
import simplexNoise4dShaderUrl from "./shaders/includes/simplex-noise-4d.glsl?url";
import wobbleFragmentShaderUrl from "./shaders/wobble/fragment.glsl?url";
import wobbleVertexShaderUrl from "./shaders/wobble/vertex.glsl?url";

// LOCAL TYPES
export interface Lesson39ConstructorProps {
	folderName: string;
	fileLoader?: THREE.FileLoader;
	gltfLoader?: GLTFLoader;
	hdrLoader?: HDRLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_42 {
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
		uPositionFrequency: new THREE.Uniform(0.5),
		uTimeFrequency: new THREE.Uniform(0.4),
		uStrength: new THREE.Uniform(0.25),
		uWarpPositionFrequency: new THREE.Uniform(0.38),
		uWarpTimeFrequency: new THREE.Uniform(0.12),
		uWarpStrength: new THREE.Uniform(1.7),
		uColorA: new THREE.Uniform(new THREE.Color("#0000ff")),
		uColorB: new THREE.Uniform(new THREE.Color("#ff0000")),
	};
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

		const hdrTexture = await this.loadHdrTexture(urbanAllayTextureUrl);
		hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

		this.app.scene.background = hdrTexture;
		this.app.scene.environment = hdrTexture;
		this.scene = new THREE.Group();

		// Shaders
		const simplexNoise4dShader = await this.loadFile(simplexNoise4dShaderUrl);
		const vertexShader = await this.loadFile(wobbleVertexShaderUrl);
		const fragmentShader = await this.loadFile(wobbleFragmentShaderUrl);

		// Materials
		const material = new CustomShaderMaterial<
			(typeof THREE)["MeshPhysicalMaterial"]
		>({
			// CSM
			baseMaterial: THREE.MeshPhysicalMaterial,
			vertexShader: vertexShader.replace(
				"#include simplexNoise4d",
				simplexNoise4dShader,
			),
			fragmentShader: fragmentShader,
			uniforms: this.uniforms,

			// MeshPhysicalMaterial
			metalness: 0,
			roughness: 0.5,
			color: this.uniforms.uColorA.value,
			transmission: 0,
			ior: 1.5,
			thickness: 1.5,
			transparent: true,
			wireframe: false,
		});
		const depthMaterial = new CustomShaderMaterial<
			(typeof THREE)["MeshDepthMaterial"]
		>({
			// CSM
			baseMaterial: THREE.MeshDepthMaterial,
			vertexShader: vertexShader.replace(
				"#include simplexNoise4d",
				simplexNoise4dShader,
			),
			uniforms: this.uniforms,

			// MeshDepthMaterial
			depthPacking: THREE.RGBADepthPacking,
		});

		// Models
		const { scene: suzanneModel } = await this.loadGltfModel(suzanneModelUrl);

		suzanneModel.traverseVisible((child) => {
			if (!(child instanceof THREE.Mesh)) return;
			child.material = material;
			child.customDepthMaterial = depthMaterial;
			child.castShadow = true;
			child.receiveShadow = true;
		});

		let geometry = new THREE.IcosahedronGeometry(2.5, 50);
		geometry = mergeVertices(geometry) as THREE.IcosahedronGeometry;
		geometry.computeTangents();

		// const wobble = new THREE.Mesh(geometry, material);
		// wobble.customDepthMaterial = depthMaterial;
		// wobble.receiveShadow = true;
		// wobble.castShadow = true;

		// Plane
		const plane = new THREE.Mesh(
			new THREE.PlaneGeometry(15, 15, 15),
			new THREE.MeshStandardMaterial(),
		);
		plane.receiveShadow = true;
		plane.rotation.y = Math.PI;
		plane.position.y = -5;
		plane.position.z = 5;

		// Lights
		const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.set(1024, 1024);
		directionalLight.shadow.camera.far = 15;
		directionalLight.shadow.normalBias = 0.05;
		directionalLight.position.set(0.25, 2, -2.25);

		// Scene
		this.scene.add(suzanneModel, plane, directionalLight);
		this.app.scene.add(this.scene);

		// Camera
		this.app.camera.position.set(13, -3, -5);

		// Animation
		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;

			this.uniforms.uTime.value = elapsedTime;
		});

		// GUI
		this.gui
			?.add(this.uniforms.uPositionFrequency, "value", 0, 2, 0.001)
			.name("Position Frequency");
		this.gui
			?.add(this.uniforms.uTimeFrequency, "value", 0, 2, 0.001)
			.name("Time Frequency");
		this.gui
			?.add(this.uniforms.uStrength, "value", 0, 1, 0.001)
			.name("Strength");
		this.gui
			?.add(this.uniforms.uWarpPositionFrequency, "value", 0, 2, 0.001)
			.name("Warp Pos Frequency");
		this.gui
			?.add(this.uniforms.uWarpTimeFrequency, "value", 0, 2, 0.001)
			.name("Warp Time Frequency");
		this.gui
			?.add(this.uniforms.uWarpStrength, "value", 0, 1, 0.001)
			.name("Warp Strength");
		this.gui?.add(material, "metalness", 0, 1, 0.001);
		this.gui?.add(material, "roughness", 0, 1, 0.001);
		this.gui?.add(material, "transmission", 0, 1, 0.001);
		this.gui?.add(material, "ior", 0, 10, 0.001);
		this.gui?.add(material, "thickness", 0, 10, 0.001);
		this.gui
			?.addColor(this.uniforms.uColorA, "value")
			.name("Color A")
			.onChange((value: string) => {
				this.uniforms.uColorA.value.set(value);
			});
		this.gui
			?.addColor(this.uniforms.uColorB, "value")
			.name("Color B")
			.onChange((value: string) => {
				this.uniforms.uColorB.value.set(value);
			});
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
		this.app.scene.environment = null;

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
