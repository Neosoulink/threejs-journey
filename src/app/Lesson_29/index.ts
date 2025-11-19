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
	TextureLoader: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_29 {
	folderName = "Lesson 29 | Raging sea";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	fileLoader: THREE.FileLoader;
	geometry?: THREE.PlaneGeometry;
	material?: THREE.ShaderMaterial;
	textureLoader: THREE.TextureLoader;
	configs = {
		time: 0,

		bigWavesElevation: 0.35,
		bigWavesFrequency: {
			x: 4,
			y: 1.5,
		},
		bigWavesSpeed: 0.35,

		smallWavesElevation: 0.08,
		smallWavesFrequency: { x: 2.0, y: 3.0 },
		smallWavesSpeed: 0.2,
		smallWavesIterations: 3.0,

		wavesDepthColor: "#394da7",
		wavesSurfaceColor: "#9bd8ff",
		wavesColorMultiplier: 6,
		wavesColorOffset: 0.3,
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson29ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.textureLoader = props?.TextureLoader ?? new THREE.TextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.mainGroup) this.destroy();

		if (!this.mainGroup) {
			this.mainGroup = new THREE.Group();
			this.app.camera.position.set(1, 1, 2);

			// Geometry
			this.geometry = new THREE.PlaneGeometry(2, 2, 512, 512);

			// Material
			const vertexShader = await this.loadFile(vertexShaderUrl);
			const fragmentShader = await this.loadFile(fragmentShaderUrl);
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

			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add(this.material.uniforms.uBigWavesElevation, "value", 0, 1, 0.001)
				.name("Big Waves Elevation");
			this.gui
				?.add(
					this.material.uniforms.uBigWavesFrequency.value,
					"x",
					0,
					10,
					0.001
				)
				.name("Big Waves Frequency X");
			this.gui
				?.add(
					this.material.uniforms.uBigWavesFrequency.value,
					"y",
					0,
					10,
					0.001
				)
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
				?.add(
					this.material.uniforms.uWavesColorMultiplier,
					"value",
					0,
					10,
					0.001
				)
				.name("Waves Color Multiplier");
			this.gui
				?.add(this.material.uniforms.uWavesColorOffset, "value", 0, 3, 0.001)
				.name("Waves Color Offset");

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}
		const clock = new THREE.Clock();

		this.app.setUpdateCallback(this.folderName, () => {
			this.update(clock.getElapsedTime());
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
