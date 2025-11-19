import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// SHADERS
import vertexShaderUrl from "./shaders/vertex.glsl?url";
import fragmentShaderUrl from "./shaders/fragment.glsl?url";

// LOCAL TYPES
export interface Lesson28ConstructorProps {
	fileLoader?: THREE.FileLoader;
	TextureLoader: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_28 {
	folderName = "Lesson 28 | Shaders patterns";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	fileLoader: THREE.FileLoader;
	meshShader: THREE.ShaderMaterialParameters = {};
	material?: THREE.RawShaderMaterial;
	textureLoader: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson28ConstructorProps) {
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

		if (this.mainGroup) {
			this.destroy();
		}

		if (!this.mainGroup) {
			this.mainGroup = new THREE.Group();
			this.app.camera.position.set(0, 0, 1);

			// Geometry
			const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);

			// Material
			const vertexShader = await this.loadFile(vertexShaderUrl);
			const fragmentShader = await this.loadFile(fragmentShaderUrl);
			const material = new THREE.ShaderMaterial({
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				side: THREE.DoubleSide,
			});

			// Mesh
			const mesh = new THREE.Mesh(geometry, material);

			this.mainGroup.add(mesh);
			this.app.scene.add(this.mainGroup);

			this.gui = this.appGui?.addFolder(this.folderName);
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
		if (this.material?.uniforms.uTime) {
			this.material.uniforms.uTime.value = elapsedTime;
		}
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

			if (this.app.updateCallbacks[this.folderName]) {
				delete this.app.updateCallbacks[this.folderName];
			}

			this.onDestruct && this.onDestruct();
		}
	}
}
