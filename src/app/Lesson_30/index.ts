import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import vertexShaderUrl from "./shaders/vertex.glsl?url";
import fragmentShaderUrl from "./shaders/fragment.glsl?url";

// LOCAL TYPES
export interface Lesson29ConstructorProps {
	fileLoader?: THREE.FileLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_30 {
	folderName = "Lesson 30 | Animated galaxy";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	fileLoader: THREE.FileLoader;
	geometry?: THREE.BufferGeometry;
	vertexShader?: string;
	fragmentShader?: string;
	material?: THREE.ShaderMaterial;
	points?: THREE.Points;
	configs = {
		time: 0,

		pointCount: 200000,
		pointSize: 0.005,
		pointRadius: 5,
		pointBranches: 3,
		pointSpin: 1,
		pointRandomness: 0.5,
		pointRandomnessPower: 3,
		pointInsideColor: "#ff6030",
		pointOutsideColor: "#1b3984",

		shaderPointSize: 15.0,
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson29ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();

		(async () => {
			this.vertexShader = await this.loadFile(vertexShaderUrl);
			this.fragmentShader = await this.loadFile(fragmentShaderUrl);
		})();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}
		if (this.mainGroup) this.destroy();
		if (this.mainGroup) return;

		const clock = new THREE.Clock();
		this.mainGroup = new THREE.Group();
		this.gui = this.appGui?.addFolder(this.folderName);

		await this.generateGalaxy();

		this.gui
			?.add(this.configs, "pointCount")
			.min(100)
			.max(1000000)
			.step(100)
			.onFinishChange(this.generateGalaxy.bind(this));
		this.gui
			?.add(this.configs, "pointRadius")
			.min(0.01)
			.max(20)
			.step(0.01)
			.onFinishChange(this.generateGalaxy.bind(this));
		this.gui
			?.add(this.configs, "pointBranches")
			.min(2)
			.max(20)
			.step(1)
			.onFinishChange(this.generateGalaxy.bind(this));
		this.gui
			?.add(this.configs, "pointRandomness")
			.min(0)
			.max(2)
			.step(0.001)
			.onFinishChange(this.generateGalaxy.bind(this));
		this.gui
			?.add(this.configs, "pointRandomnessPower")
			.min(1)
			.max(10)
			.step(0.001)
			.onFinishChange(this.generateGalaxy.bind(this));
		this.gui
			?.addColor(this.configs, "pointInsideColor")
			.onFinishChange(this.generateGalaxy.bind(this));
		this.gui
			?.addColor(this.configs, "pointOutsideColor")
			.onFinishChange(this.generateGalaxy.bind(this));

		this.gui
			?.add(this.configs, "shaderPointSize")
			.min(1)
			.max(20)
			.step(0.1)
			.onChange(() => {
				if (this.material)
					this.material.uniforms.uPointSize.value =
						this.configs.shaderPointSize;
			});

		this.gui
			?.add({ function: () => this.destroy() }, "function")
			.name("Destroy");

		this.app.scene.add(this.mainGroup);
		this.app.camera.position.set(3, 3, 3);
		this.app.setUpdateCallback(this.folderName, () => {
			this.update(clock.getElapsedTime());
		});

		this.onConstruct && this.onConstruct();
	}

	async generateGalaxy() {
		this.dispose();

		// Geometry
		this.geometry = new THREE.BufferGeometry();

		const positions = new Float32Array(this.configs.pointCount * 3);
		const colors = new Float32Array(this.configs.pointCount * 3);
		const scales = new Float32Array(this.configs.pointCount * 1);
		const randomness = new Float32Array(this.configs.pointCount * 3);

		const insideColor = new THREE.Color(this.configs.pointInsideColor);
		const outsideColor = new THREE.Color(this.configs.pointOutsideColor);

		for (let i = 0; i < this.configs.pointCount; i++) {
			const i3 = i * 3;

			// Position
			const radius = Math.random() * this.configs.pointRadius;

			const branchAngle =
				((i % this.configs.pointBranches) / this.configs.pointBranches) *
				Math.PI *
				2;

			positions[i3 + 0] = Math.cos(branchAngle) * radius;
			positions[i3 + 1] = 0.0;
			positions[i3 + 2] = Math.sin(branchAngle) * radius;

			// Randomness

			const randomX =
				Math.pow(Math.random(), this.configs.pointRandomnessPower) *
				(Math.random() < 0.5 ? 1 : -1) *
				this.configs.pointRandomness *
				radius;
			const randomY =
				Math.pow(Math.random(), this.configs.pointRandomnessPower) *
				(Math.random() < 0.5 ? 1 : -1) *
				this.configs.pointRandomness *
				radius;
			const randomZ =
				Math.pow(Math.random(), this.configs.pointRandomnessPower) *
				(Math.random() < 0.5 ? 1 : -1) *
				this.configs.pointRandomness *
				radius;

			randomness[i3 + 0] = randomX;
			randomness[i3 + 1] = randomY;
			randomness[i3 + 2] = randomZ;

			// Color
			const mixedColor = insideColor.clone();
			mixedColor.lerp(outsideColor, radius / this.configs.pointRadius);

			colors[i3 + 0] = mixedColor.r;
			colors[i3 + 1] = mixedColor.g;
			colors[i3 + 2] = mixedColor.b;

			// Scale
			scales[i] = Math.random();
		}

		this.geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, 3)
		);
		this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
		this.geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
		this.geometry.setAttribute(
			"aRandomness",
			new THREE.BufferAttribute(randomness, 3)
		);

		// Material
		this.material = new THREE.ShaderMaterial({
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			uniforms: {
				uTime: { value: 0 },
				uPointSize: {
					value:
						this.configs.shaderPointSize * this.app.renderer.getPixelRatio(),
				},
			},
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			vertexColors: true,
		});

		// Points
		this.points = new THREE.Points(this.geometry, this.material);
		this.mainGroup?.add(this.points);
	}

	async loadFile(fileLocation: string) {
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

	update(elapsedTime: number) {
		if (this.material?.uniforms.uTime)
			this.material.uniforms.uTime.value = elapsedTime;
	}

	dispose() {
		this.geometry?.dispose();
		this.material?.dispose();
		if (this.points) this.mainGroup?.remove(this.points);
	}

	destroy() {
		this.dispose();
		if (!this.mainGroup) return;

		this.mainGroup.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose();

				for (const key in child.material) {
					const value = child.material[key];

					if (value && typeof value.dispose === "function") {
						value.dispose();
					}
				}
			}
		});

		this.app.scene.remove(this.mainGroup);

		this.mainGroup?.clear();
		this.mainGroup = undefined;

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
