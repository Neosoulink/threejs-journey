import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import glPerlinClassic3DUrl from "./shaders/includes/perlin-classic-3d.glsl?url";
import glAmbientLightUrl from "./shaders/includes/ambient-light.glsl?url";
import glPointLightUrl from "./shaders/includes/point-light.glsl?url";
import glDirectionalLightUrl from "./shaders/includes/directional-light.glsl?url";
import glVertexShaderUrl from "./shaders/water/vertex.glsl?url";
import glFragmentShaderUrl from "./shaders/water/fragment.glsl?url";

// LOCAL TYPES
export interface Lesson36ConstructorProps {
	fileLoader?: THREE.FileLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_36 {
	folderName = "Lesson 36 | Raging sea Shading";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	fileLoader: THREE.FileLoader;
	geometry?: THREE.PlaneGeometry;
	material?: THREE.ShaderMaterial;
	configs = {
		time: 0,

		bigWavesElevation: 0.2,
		bigWavesFrequency: {
			x: 4,
			y: 1.5,
		},
		bigWavesSpeed: 0.75,

		smallWavesElevation: 0.15,
		smallWavesFrequency: { x: 3.0, y: 3.0 },
		smallWavesSpeed: 0.2,
		smallWavesIterations: 4.0,

		wavesDepthColor: "#ff4000",
		wavesSurfaceColor: "#151c37",
		wavesColorMultiplier: 1,
		wavesColorOffset: 0.925,
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson36ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		this.gui?.children.forEach((child) => {
			child.destroy();
		});
		if (this.mainGroup) this.destroy();
		if (this.mainGroup) return;

		this.mainGroup = new THREE.Group();

		// Geometry
		this.geometry = new THREE.PlaneGeometry(2, 2, 512, 512);
		this.geometry.deleteAttribute("normal");
		this.geometry.deleteAttribute("uv");

		// Material
		const glPerlinClassic3D = await this.loadFile(glPerlinClassic3DUrl);
		const glAmbientLight = await this.loadFile(glAmbientLightUrl);
		const glPointLight = await this.loadFile(glPointLightUrl);
		const glDirectionalLight = await this.loadFile(glDirectionalLightUrl);
		let vertexShader = await this.loadFile(glVertexShaderUrl);
		let fragmentShader = await this.loadFile(glFragmentShaderUrl);

		vertexShader = vertexShader?.replace(
			"#include <perlinClassic3D>",
			glPerlinClassic3D ?? ""
		);
		fragmentShader = fragmentShader
			?.replace("#include <ambientLight>", glAmbientLight ?? "")
			.replace("#include <pointLight>", glPointLight ?? "")
			.replace("#include <directionalLight>", glDirectionalLight ?? "");
		this.material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: { value: this.configs.time },

				uBigWavesFrequency: {
					value: new THREE.Vector2(
						this.configs.bigWavesFrequency.x,
						this.configs.bigWavesFrequency.y
					),
				},
				uBigWavesSpeed: { value: this.configs.bigWavesSpeed },
				uBigWavesElevation: { value: this.configs.bigWavesElevation },

				uWavesDepthColor: {
					value: new THREE.Color(this.configs.wavesDepthColor),
				},
				uWavesSurfaceColor: {
					value: new THREE.Color(this.configs.wavesSurfaceColor),
				},
				uWavesColorOffset: { value: this.configs.wavesColorOffset },
				uWavesColorMultiplier: {
					value: this.configs.wavesColorMultiplier,
				},

				uSmallWavesElevation: { value: this.configs.smallWavesElevation },
				uSmallWavesFrequency: { value: this.configs.smallWavesFrequency },
				uSmallWavesSpeed: { value: this.configs.smallWavesSpeed },
				uSmallWavesIterations: { value: this.configs.smallWavesIterations },
			},
		});

		// Mesh
		const mesh = new THREE.Mesh(this.geometry, this.material);
		mesh.rotation.x = -Math.PI * 0.5;

		this.mainGroup.add(mesh);
		this.app.scene.add(this.mainGroup);

		this.app.camera.position.set(1, 2, 2);

		this.app.renderer.toneMapping = THREE.ACESFilmicToneMapping;

		this.gui
			?.add(this.material.uniforms.uBigWavesElevation, "value", 0, 1, 0.001)
			.name("Big Waves Elevation");
		this.gui
			?.add(this.material.uniforms.uBigWavesFrequency.value, "x", 0, 10, 0.001)
			.name("Big Waves Frequency X");
		this.gui
			?.add(this.material.uniforms.uBigWavesFrequency.value, "y", 0, 10, 0.001)
			.name("Big Waves Frequency Z");
		this.gui
			?.add(this.material.uniforms.uBigWavesSpeed, "value", 0, 5, 0.001)
			.name("Big Waves Speed");

		this.gui
			?.add(this.material.uniforms.uSmallWavesElevation, "value", 0, 1, 0.001)
			.name("Small Waves Elevation");
		this.gui
			?.add(
				this.material.uniforms.uSmallWavesFrequency.value,
				"x",
				0,
				30,
				0.001
			)
			.name("Small Waves Frequency X");
		this.gui
			?.add(
				this.material.uniforms.uSmallWavesFrequency.value,
				"y",
				0,
				30,
				0.001
			)
			.name("Small Waves Frequency Z");
		this.gui
			?.add(this.material.uniforms.uSmallWavesSpeed, "value", 0, 4, 0.001)
			.name("Small Waves Speed");
		this.gui
			?.add(this.material.uniforms.uSmallWavesIterations, "value", 0, 10, 1)
			.name("Small Waves Iterations");

		this.gui
			?.addColor(this.configs, "wavesDepthColor")
			.onChange(() => {
				if (this.material)
					this.material.uniforms.uWavesDepthColor.value.set(
						this.configs.wavesDepthColor
					);
			})
			.name("Waves Depth Color");
		this.gui
			?.addColor(this.configs, "wavesSurfaceColor")
			.onChange(() => {
				if (this.material)
					this.material.uniforms.uWavesSurfaceColor.value.set(
						this.configs.wavesSurfaceColor
					);
			})
			.name("Waves Surface Color");
		this.gui
			?.add(this.material.uniforms.uWavesColorMultiplier, "value", 0, 2, 0.001)
			.name("Waves Color Multiplier");
		this.gui
			?.add(this.material.uniforms.uWavesColorOffset, "value", 0, 3, 0.001)
			.name("Waves Color Offset");

		this.gui
			?.add({ function: () => this.destroy() }, "function")
			.name("Destroy");
		this.gui?.open();

		setTimeout(() => {
			this.appGui?.domElement.scrollTo(0, 9999);
		}, 2000);

		this.app.setUpdateCallback(this.folderName, () => {
			this.update(this.app.time.elapsed * 0.001);
		});

		this.onConstruct && this.onConstruct();
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

	destroy() {
		if (!this.mainGroup) return;

		this.mainGroup.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose();

				for (const key in child.material) {
					const value = child.material[key];

					if (value && typeof value.dispose === "function") value.dispose();
				}
			}
		});

		this.app.scene.remove(this.mainGroup);

		this.mainGroup?.clear();
		this.mainGroup = undefined;

		this.gui?.children.forEach((child, i) => {
			setTimeout(() => child.destroy(), i * 10);
		});
		this.gui
			?.add({ function: () => this.construct() }, "function")
			.name("Construct");

		if (this.app.updateCallbacks[this.folderName])
			delete this.app.updateCallbacks[this.folderName];

		this.app.renderer.toneMapping = THREE.NoToneMapping;

		this.onDestruct && this.onDestruct();
	}
}
