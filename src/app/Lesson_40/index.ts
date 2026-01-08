import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import gsap from "gsap";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// ASSETS
import particleVertexShaderUrl from "./shaders/particles/vertex.glsl?url";
import particleFragmentShaderUrl from "./shaders/particles/fragment.glsl?url";
import simplexNoise3DUrl from "./shaders/includes/simplex-noise-3d.glsl?url";
import modelGltfUrl from "@/assets/models/morphing/models.glb?url";

// LOCAL TYPES
export interface Lesson39ConstructorProps {
	fileLoader?: THREE.FileLoader;
	gltfLoader?: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_40 {
	folderName = "Lesson 40 | Particles Morphing";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader = new THREE.FileLoader();
	gltfLoader: GLTFLoader;
	configs = {
		uTime: new THREE.Uniform(0),
		uSize: new THREE.Uniform(0.3),
		uProgress: new THREE.Uniform(0),
		uResolution: new THREE.Uniform(
			new THREE.Vector2(
				this.app.sizes.width * this.app.sizes.pixelRatio,
				this.app.sizes.height * this.app.sizes.pixelRatio
			)
		),
		colorA: "#ff7300",
		colorB: "#0091ff",
		modelsLength: 0,
		currentPosIndex: 0,
		particlesPositions: [] as THREE.Float32BufferAttribute[],
	};
	geometry?: THREE.BufferGeometry;
	tl?: gsap.core.Timeline;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson39ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.gltfLoader = props?.gltfLoader ?? new GLTFLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		this.gui?.children.forEach((child) => child.destroy());
		if (this.scene) this.destruct();

		this.tl = gsap.timeline();
		this.scene = new THREE.Group();

		// Models Positions
		const gltfModels = await this.loadGltfModel(modelGltfUrl);
		let positionsMaxCount = 0;
		const modelsPositions =
			gltfModels?.scene.children.map((child) => {
				const mesh = child as THREE.Mesh;
				const positionAttribute = mesh.geometry.getAttribute(
					"position"
				) as THREE.BufferAttribute;

				if (positionAttribute.count > positionsMaxCount)
					positionsMaxCount = positionAttribute.count;

				return positionAttribute;
			}) ?? [];
		this.configs.particlesPositions = [];
		const particlesSizes = new Float32Array(positionsMaxCount);

		modelsPositions.forEach((position) => {
			const oldArray = position.array;
			const newArray = new Float32Array(positionsMaxCount * 3);

			for (let i = 0; i < positionsMaxCount; i++) {
				const i3 = i * 3;
				const randomI3 = Math.floor(position.count * Math.random()) * 3;

				newArray[i3 + 0] = oldArray[i3 + 0] || oldArray[randomI3 + 0];
				newArray[i3 + 1] = oldArray[i3 + 1] || oldArray[randomI3 + 1];
				newArray[i3 + 2] = oldArray[i3 + 2] || oldArray[randomI3 + 2];

				particlesSizes[i] = Math.random();
			}

			this.configs.particlesPositions.push(
				new THREE.Float32BufferAttribute(newArray, 3)
			);
		});
		this.configs.modelsLength = this.configs.particlesPositions.length;

		// Shaders
		const simplexNoise3D = await this.loadFile(simplexNoise3DUrl);
		const vertexShader = await this.loadFile(particleVertexShaderUrl);
		const fragmentShader = await this.loadFile(particleFragmentShaderUrl);

		// Particles
		this.geometry = new THREE.BufferGeometry();
		this.geometry.setAttribute(
			"position",
			this.configs.particlesPositions[this.configs.currentPosIndex]
		);
		this.geometry.setAttribute(
			"aPositionTarget",
			this.configs.particlesPositions[this.getNextPosIndex()]
		);
		this.geometry.setAttribute(
			"aSize",
			new THREE.Float32BufferAttribute(particlesSizes, 1)
		);

		const material = new THREE.ShaderMaterial({
			vertexShader: vertexShader?.replace(
				"#include <simplex_noise_3d>",
				simplexNoise3D ?? ""
			),
			fragmentShader,
			depthWrite: false,
			transparent: true,
			blending: THREE.AdditiveBlending,

			uniforms: {
				uTime: this.configs.uTime,
				uSize: this.configs.uSize,
				uProgress: this.configs.uProgress,
				uResolution: this.configs.uResolution,
				uColorA: new THREE.Uniform(new THREE.Color(this.configs.colorA)),
				uColorB: new THREE.Uniform(new THREE.Color(this.configs.colorB)),
			},
		});
		const points = new THREE.Points(this.geometry, material);
		points.frustumCulled = false;

		this.scene.add(points);
		this.app.scene.add(this.scene);

		this.app.camera.position.set(0, 0, 18);

		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;

			this.configs.uTime.value = elapsedTime;
			this.configs.uResolution.value.set(
				this.app.sizes.width * this.app.sizes.pixelRatio,
				this.app.sizes.height * this.app.sizes.pixelRatio
			);
		});

		this.gui?.addColor(this.configs, "colorA").onChange(() => {
			if (material.uniforms.uColorA)
				material.uniforms.uColorA.value.set(this.configs.colorA);
		});
		this.gui?.addColor(this.configs, "colorB").onChange(() => {
			if (material.uniforms.uColorB)
				material.uniforms.uColorB.value.set(this.configs.colorB);
		});
		this.gui
			?.add(this.configs.uSize, "value", 0, 1, 0.001)
			.name("uSize")
			.listen();
		this.gui
			?.add(this.configs.uProgress, "value", 0, 1, 0.001)
			.name("uProgress")
			.listen();
		this.gui
			?.add({ function: () => this.modelMorph() }, "function")
			.name("Morph to Next Model");
		this.gui
			?.add({ function: () => this.modelMorph(0) }, "function")
			.name("Morph 1");
		this.gui
			?.add({ function: () => this.modelMorph(1) }, "function")
			.name("Morph 2");
		this.gui
			?.add({ function: () => this.modelMorph(2) }, "function")
			.name("Morph 3");
		this.gui
			?.add({ function: () => this.modelMorph(3) }, "function")
			.name("Morph 4");
		this.gui
			?.add(
				{
					function: () => {
						this.destruct();
					},
				},
				"function"
			)
			.name("Destruct");
		this.gui?.open();
		this.gui?.domElement.scrollIntoView({ block: "center" });

		this.onConstruct && this.onConstruct();
	}

	async loadFile(fileLocation: string) {
		return new Promise<string | undefined>((res, rej) => {
			this.fileLoader.load(
				fileLocation,
				(file) => {
					res(file.toString());
				},
				undefined,
				() => rej(undefined)
			);
		});
	}

	async loadGltfModel(fileLocation: string) {
		return new Promise<GLTF | undefined>((res, rej) => {
			this.gltfLoader.load(
				fileLocation,
				(gltf) => res(gltf),
				undefined,
				() => rej(undefined)
			);
		});
	}

	getNextPosIndex(index = this.configs.currentPosIndex) {
		let next = index + 1;
		if (this.configs.currentPosIndex >= this.configs.modelsLength) next = 0;

		return next;
	}

	modelMorph(index = this.getNextPosIndex()) {
		let validIndex = 0;
		if (index >= this.configs.modelsLength) validIndex = 0;
		else validIndex = index;

		this.geometry?.setAttribute(
			"position",
			this.configs.particlesPositions[this.configs.currentPosIndex]
		);
		this.geometry?.setAttribute(
			"aPositionTarget",
			this.configs.particlesPositions[validIndex]
		);

		this.tl?.progress(1);
		this.tl?.fromTo(
			this.configs.uProgress,
			{ value: 0 },
			{ value: 1, duration: 3, ease: "linear" }
		);

		this.configs.currentPosIndex = validIndex;
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

		this.tl?.progress(1);
		this.tl?.clear();
		this.tl = undefined;

		this.app.scene.remove(this.scene);

		this.scene?.clear();
		this.scene = undefined;
		this.geometry = undefined;

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
