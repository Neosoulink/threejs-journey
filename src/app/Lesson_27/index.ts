import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import flagVertexUrl from "./shaders/flag.vert?url";
import flagFragUrl from "./shaders/flag.frag?url";

// LOCAL TYPES
export interface Lesson27ConstructorProps {
	fileLoader?: THREE.FileLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_27 {
	folderName = "Lesson 27 | Shaders";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	fileLoader: THREE.FileLoader;
	meshShader: THREE.ShaderMaterialParameters = {};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson27ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;

		this.construct();
	}

	destroy() {
		if (this.mainGroup) {
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
				.name("Enable");

			this.onDestruct && this.onDestruct();
		}
	}

	async construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.mainGroup) {
			this.destroy();
		}

		if (!this.mainGroup) {
			this.mainGroup = new THREE.Group();
			this.app.camera.position.set(-0.25, 0, 3);

			/**
			 * Textures
			 */
			// const textureLoader = new THREE.TextureLoader();

			/**
			 * Test mesh
			 */
			// Geometry
			const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
			const POSITION_COUNT = (
				geometry.attributes.position as THREE.Float32BufferAttribute
			).count;
			const RANDOM_POSITION = new Float32Array(POSITION_COUNT);

			for (let i = 0; i < POSITION_COUNT; i++) {
				RANDOM_POSITION[i] = Math.random();
			}

			geometry.setAttribute(
				"aRandom",
				new THREE.BufferAttribute(RANDOM_POSITION, 1)
			);

			// Material
			const VERTEX_SHADER = await this.loadFile(flagVertexUrl);
			const FRAGMENT_SHADER = await this.loadFile(flagFragUrl);
			const material = new THREE.RawShaderMaterial({
				vertexShader: VERTEX_SHADER,
				fragmentShader: FRAGMENT_SHADER,
				side: THREE.DoubleSide,
				transparent: true,
				uniforms: {
					uFrequency: { value: new THREE.Vector2(10, 5) },
				},
			});

			// Mesh
			const mesh = new THREE.Mesh(geometry, material);

			this.mainGroup.add(mesh);

			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui
				?.add(material.uniforms.uFrequency.value, "x")
				.min(0)
				.max(20)
				.step(0.01)
				.name("FrequencyX");
			this.gui
				?.add(material.uniforms.uFrequency.value, "y")
				.min(0)
				.max(20)
				.step(0.01)
				.name("FrequencyY");

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

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
}
