import * as THREE from "three";
import GUI from "lil-gui";

import ThreeApp from "../../helpers/ThreeApp";
import vertexShaderUrl from "./shaders/gl.vert?url";
import fragmentShaderUrl from "./shaders/gl.frag?url";

import flagFrenchImg from "../../assets/img/textures/flag/flag-french.jpg?url";

export interface Lesson27ConstructorProps {
	fileLoader?: THREE.FileLoader;
	textureLoader: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_27 {
	folderName = "Lesson 27 | Shaders";
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

	constructor(props?: Lesson27ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
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

			const geometry = new THREE.PlaneGeometry(1, 1, 32, 32);
			const positionCount = geometry.attributes.position.count;
			const randomPosition = new Float32Array(positionCount);

			for (let i = 0; i < positionCount; i++) randomPosition[i] = Math.random();

			geometry.setAttribute(
				"aRandom",
				new THREE.BufferAttribute(randomPosition, 1)
			);

			// Material
			const vertexShader = await this.loadFile(vertexShaderUrl);
			const fragmentShader = await this.loadFile(fragmentShaderUrl);
			const material = new THREE.RawShaderMaterial({
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				side: THREE.DoubleSide,
				transparent: true,
				uniforms: {
					uFrequency: { value: new THREE.Vector2(6.5, 5) },
					uTime: { value: 0 },
					uTexture: { value: this.textureLoader.load(flagFrenchImg) },
				},
			});
			this.material = material;

			// Mesh
			const mesh = new THREE.Mesh(geometry, material);
			mesh.scale.y = 2 / 3;

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
		const CLOCK = new THREE.Clock();

		this.app.setUpdateCallback(this.folderName, () => {
			this.update(CLOCK.getElapsedTime());
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
}
