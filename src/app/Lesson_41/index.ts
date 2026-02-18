import * as THREE from "three";
import {
	GLTFLoader,
	GPUComputationRenderer,
	Variable,
} from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// ASSETS
import simplexNoise4DShaderUrl from "./shaders/includes/simplex-noise-4d.glsl?url";
import gpgpuParticlesShaderUrl from "./shaders/gpgpu/particles.glsl?url";
import particleVertexShaderUrl from "./shaders/particles/vertex.glsl?url";
import particleFragmentShaderUrl from "./shaders/particles/fragment.glsl?url";
import boatModelUtl from "@/assets/models/boat/model.glb?url";

// LOCAL TYPES
export interface Lesson39ConstructorProps {
	fileLoader?: THREE.FileLoader;
	gltfLoader?: GLTFLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_41 {
	folderName = "Lesson 41 | GPGPU Flow Field Particles";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	gltfLoader: GLTFLoader;
	configs = {
		uTime: new THREE.Uniform(0),
		uDelta: new THREE.Uniform(0),
		uSize: new THREE.Uniform(0.07),
		uResolution: new THREE.Uniform(
			new THREE.Vector2(
				this.app.sizes.width * this.app.sizes.pixelRatio,
				this.app.sizes.height * this.app.sizes.pixelRatio,
			),
		),
	};
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

		this.scene = new THREE.Group();

		// Shaders
		const simplexNoise4DShader = await this.loadFile(simplexNoise4DShaderUrl);
		const gpgpuParticlesShader = await this.loadFile(gpgpuParticlesShaderUrl);
		const vertexShader = await this.loadFile(particleVertexShaderUrl);
		const fragmentShader = await this.loadFile(particleFragmentShaderUrl);

		// Models
		const boatGltf = await this.loadGltfModel(boatModelUtl);

		// Base Geometry
		const baseGeometry: {
			instance?: THREE.BufferGeometry;
			count?: number;
		} = {};
		baseGeometry.instance = (boatGltf.scene.children[0] as THREE.Mesh)
			.geometry as THREE.BufferGeometry;
		baseGeometry.count = baseGeometry.instance.attributes.position.count;

		// GPU Compute
		const gpgpu: {
			size?: number;
			computation?: GPUComputationRenderer;
			particlesVariable?: Variable;
			debugMesh?: THREE.Mesh;
		} = {};
		gpgpu.size = Math.ceil(Math.sqrt(baseGeometry.count));
		gpgpu.computation = new GPUComputationRenderer(
			gpgpu.size,
			gpgpu.size,
			this.app.renderer,
		);

		// Base Texture
		const baseParticlesTexture = gpgpu.computation.createTexture();

		for (let i = 0; i < baseGeometry.count; i++) {
			const i3 = i * 3;
			const i4 = i * 4;

			baseParticlesTexture.image.data![i4 + 0] =
				baseGeometry.instance.attributes.position.array[i3 + 0];
			baseParticlesTexture.image.data![i4 + 1] =
				baseGeometry.instance.attributes.position.array[i3 + 1];
			baseParticlesTexture.image.data![i4 + 2] =
				baseGeometry.instance.attributes.position.array[i3 + 2];
			baseParticlesTexture.image.data![i4 + 3] = Math.random();
		}

		// Particles Variables
		gpgpu.particlesVariable = gpgpu.computation.addVariable(
			"uParticles",
			gpgpuParticlesShader.replace(
				"#include simplexNoise4d",
				simplexNoise4DShader,
			),
			baseParticlesTexture,
		);
		gpgpu.computation.setVariableDependencies(gpgpu.particlesVariable, [
			gpgpu.particlesVariable,
		]);
		gpgpu.particlesVariable.material.uniforms.uTime = this.configs.uTime;
		gpgpu.particlesVariable.material.uniforms.uDelta = this.configs.uDelta;
		gpgpu.particlesVariable.material.uniforms.uBase = new THREE.Uniform(
			baseParticlesTexture,
		);
		gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence =
			new THREE.Uniform(0.5);
		gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength =
			new THREE.Uniform(2);
		gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency =
			new THREE.Uniform(0.5);

		// Gpgpu Init
		gpgpu.computation.init();
		gpgpu.debugMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(3, 3),
			new THREE.MeshBasicMaterial({
				map: gpgpu.computation.getCurrentRenderTarget(gpgpu.particlesVariable)
					.texture,
			}),
		);
		gpgpu.debugMesh.visible = false;
		gpgpu.debugMesh.position.x = -4;

		// Particles
		const particles: {
			geometry?: THREE.BufferGeometry;
			material?: THREE.ShaderMaterial;
			points?: THREE.Points;
		} = {};
		const particlesUvArray = new Float32Array(baseGeometry.count * 2);
		const sizesArray = new Float32Array(baseGeometry.count);

		for (let y = 0; y < gpgpu.size; y++) {
			for (let x = 0; x < gpgpu.size; x++) {
				const i = y * gpgpu.size + x;
				const i2 = i * 2;

				const uvX = (x + 0.5) / gpgpu.size;
				const uvY = (y + 0.5) / gpgpu.size;

				particlesUvArray[i2 + 0] = uvX;
				particlesUvArray[i2 + 1] = uvY;

				sizesArray[i] = Math.random();
			}
		}

		particles.geometry = new THREE.BufferGeometry();
		particles.geometry.setDrawRange(0, baseGeometry.count);
		particles.geometry.setAttribute(
			"aParticlesUv",
			new THREE.BufferAttribute(particlesUvArray, 2),
		);
		particles.geometry.setAttribute(
			"aColor",
			baseGeometry.instance.getAttribute("color"),
		);
		particles.geometry.setAttribute(
			"aSize",
			new THREE.BufferAttribute(sizesArray, 1),
		);

		particles.material = new THREE.ShaderMaterial({
			vertexShader,
			fragmentShader,
			uniforms: {
				uTime: this.configs.uTime,
				uSize: this.configs.uSize,
				uResolution: this.configs.uResolution,
				uParticlesTexture: new THREE.Uniform<Variable | undefined>(undefined),
			},
		});

		// Points
		particles.points = new THREE.Points(particles.geometry, particles.material);

		// Scene
		this.scene.add(particles.points, gpgpu.debugMesh);
		this.app.scene.add(this.scene);

		// Camera
		this.app.camera.position.set(4.5, 4, 11);

		// Animation
		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;

			this.configs.uTime.value = elapsedTime;
			this.configs.uDelta.value = this.app.time.delta * 0.001;
			this.configs.uResolution.value.set(
				this.app.sizes.width * this.app.sizes.pixelRatio,
				this.app.sizes.height * this.app.sizes.pixelRatio,
			);

			gpgpu.computation?.compute();
			if (particles.material && gpgpu.computation && gpgpu.particlesVariable)
				particles.material.uniforms.uParticlesTexture.value =
					gpgpu.computation.getCurrentRenderTarget(
						gpgpu.particlesVariable,
					).texture;
		});

		// GUI
		this.gui
			?.add(this.configs.uSize, "value", 0.01, 0.5, 0.01)
			.name("Particles Size");
		this.gui
			?.add(
				gpgpu.particlesVariable.material.uniforms.uFlowFieldInfluence,
				"value",
				0,
				1,
				0.01,
			)
			.name("Flow Field Influence");
		this.gui
			?.add(
				gpgpu.particlesVariable.material.uniforms.uFlowFieldStrength,
				"value",
				0,
				10,
				0.01,
			)
			.name("Flow Field Strength");
		this.gui
			?.add(
				gpgpu.particlesVariable.material.uniforms.uFlowFieldFrequency,
				"value",
				0,
				1,
				0.01,
			)
			.name("Flow Field Frequency");
		this.gui?.add(gpgpu.debugMesh, "visible").name("Visible Debug");
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

	async loadFile(fileLocation: string) {
		return (await this.fileLoader.loadAsync(fileLocation)).toString();
	}

	async loadGltfModel(fileLocation: string) {
		return await this.gltfLoader.loadAsync(fileLocation);
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
