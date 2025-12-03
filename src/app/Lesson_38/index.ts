import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// ASSETS
import glEarthVertexShaderUrl from "./shaders/earth/vertex.glsl?url";
import glEarthFragmentShaderUrl from "./shaders/earth/fragment.glsl?url";
import glAtmosphereVertexShaderUrl from "./shaders/atmosphere/vertex.glsl?url";
import glAtmosphereFragmentShaderUrl from "./shaders/atmosphere/fragment.glsl?url";
import earthDayTextureUrl from "@/assets/img/textures/earth/day.jpg?url";
import earthNightTextureUrl from "@/assets/img/textures/earth/night.jpg?url";
import earthSpecularTextureUrl from "@/assets/img/textures/earth/specularClouds.jpg?url";

// LOCAL TYPES
export interface Lesson38ConstructorProps {
	fileLoader?: THREE.FileLoader;
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_38 {
	folderName = "Lesson 38 | Earth";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	textureLoader: THREE.TextureLoader;
	configs = {
		uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(0x00aaff)),
		uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color(0xff6600)),
		uTime: new THREE.Uniform(0),
		uSunDirection: new THREE.Uniform(new THREE.Vector3()),
	};
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props?: Lesson38ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;

		this.construct();
	}

	async construct() {
		this.gui?.children.forEach((child) => {
			child.destroy();
		});
		if (this.scene) this.destroy();
		if (this.scene) return;

		this.scene = new THREE.Group();

		// Geometry
		const earthGeometry = new THREE.SphereGeometry(2, 64, 64);

		// Textures
		const earthDayTexture = await this.textureLoader.loadAsync(
			earthDayTextureUrl
		);
		earthDayTexture.colorSpace = THREE.SRGBColorSpace;
		earthDayTexture.anisotropy = 8;
		const earthNightTexture = await this.textureLoader.loadAsync(
			earthNightTextureUrl
		);
		earthNightTexture.colorSpace = THREE.SRGBColorSpace;
		earthNightTexture.anisotropy = 8;
		const earthSpecularTexture = await this.textureLoader.loadAsync(
			earthSpecularTextureUrl
		);
		earthSpecularTexture.anisotropy = 8;

		// Shader
		const earthVertexShader = await this.loadFile(glEarthVertexShaderUrl);
		const earthFragmentShader = await this.loadFile(glEarthFragmentShaderUrl);
		const atmosphereVertexShader = await this.loadFile(
			glAtmosphereVertexShaderUrl
		);
		const atmosphereFragmentShader = await this.loadFile(
			glAtmosphereFragmentShaderUrl
		);

		// Material
		const earthMaterial = new THREE.ShaderMaterial({
			vertexShader: earthVertexShader?.replace(
				"#include <perlinClassic3D>",
				""
			),
			fragmentShader: earthFragmentShader,
			side: THREE.DoubleSide,
			uniforms: {
				uTime: this.configs.uTime,
				uDayTexture: new THREE.Uniform(earthDayTexture),
				uNightTexture: new THREE.Uniform(earthNightTexture),
				uSpecularTexture: new THREE.Uniform(earthSpecularTexture),
				uSunDirection: this.configs.uSunDirection,
				uAtmosphereDayColor: this.configs.uAtmosphereDayColor,
				uAtmosphereTwilightColor: this.configs.uAtmosphereTwilightColor,
			},
		});
		const atmosphereMaterial = new THREE.ShaderMaterial({
			vertexShader: atmosphereVertexShader,
			fragmentShader: atmosphereFragmentShader,
			uniforms: {
				uSunDirection: this.configs.uSunDirection,
				uAtmosphereDayColor: this.configs.uAtmosphereDayColor,
				uAtmosphereTwilightColor: this.configs.uAtmosphereTwilightColor,
			},
			side: THREE.BackSide,
			transparent: true,
		});

		// Earth Mesh
		const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
		const atmosphereMesh = new THREE.Mesh(earthGeometry, atmosphereMaterial);
		atmosphereMesh.scale.multiplyScalar(1.04);

		// Sun
		const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
		const debugSunMesh = new THREE.Mesh(
			new THREE.IcosahedronGeometry(0.1, 2),
			new THREE.MeshBasicMaterial()
		);

		const updateSunPosition = () => {
			this.configs.uSunDirection.value.setFromSpherical(sunSpherical);

			debugSunMesh.position
				.copy(this.configs.uSunDirection.value)
				.multiplyScalar(5);
		};
		updateSunPosition();

		this.scene.add(earthMesh, atmosphereMesh, debugSunMesh);
		this.app.scene.add(this.scene);

		this.app.camera.position.set(11, 4, 4);

		this.gui
			?.addColor(
				{ value: `#${this.configs.uAtmosphereDayColor.value.getHexString()}` },
				"value"
			)
			.name("Atmosphere Day Color")
			.onChange((v: string) => this.configs.uAtmosphereDayColor.value.set(v));
		this.gui
			?.addColor(
				{
					value: `#${this.configs.uAtmosphereTwilightColor.value.getHexString()}`,
				},
				"value"
			)
			.name("Atmosphere Twilight Color")
			.onChange((v: string) =>
				this.configs.uAtmosphereTwilightColor.value.set(v)
			);
		this.gui
			?.add(sunSpherical, "radius", 0, 2, 0.01)
			.onChange(updateSunPosition);
		this.gui
			?.add(sunSpherical, "phi", 0, Math.PI, 0.001)
			.onChange(updateSunPosition);
		this.gui
			?.add(sunSpherical, "theta", -Math.PI, Math.PI, 0.001)
			.onChange(updateSunPosition);

		this.gui
			?.add({ function: () => this.destroy() }, "function")
			.name("Destruct");
		this.gui?.open();

		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;

			this.configs.uTime.value = elapsedTime;
			earthMesh.rotation.y = elapsedTime * 0.1;
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

	destroy() {
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
