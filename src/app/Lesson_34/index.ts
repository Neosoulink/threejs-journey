import GUI from "lil-gui";
import * as THREE from "three";

// HELPERS
import ThreeApp from "@/helpers/ThreeApp";

// SHADERS
import vertexShaderUrl from "./shaders/vertex.glsl?url";
import fragmentShaderUrl from "./shaders/fragment.glsl?url";

// ASSETS
import particle1ImgUrl from "@/assets/img/textures/particles/1.png?url";
import particle2ImgUrl from "@/assets/img/textures/particles/2.png?url";
import particle3ImgUrl from "@/assets/img/textures/particles/3.png?url";
import particle4ImgUrl from "@/assets/img/textures/particles/4.png?url";
import particle5ImgUrl from "@/assets/img/textures/particles/5.png?url";
import particle6ImgUrl from "@/assets/img/textures/particles/6.png?url";
import particle7ImgUrl from "@/assets/img/textures/particles/7.png?url";
import particle8ImgUrl from "@/assets/img/textures/particles/8.png?url";
import particle9ImgUrl from "@/assets/img/textures/particles/9.png?url";
import particle10ImgUrl from "@/assets/img/textures/particles/10.png?url";
import particle11ImgUrl from "@/assets/img/textures/particles/11.png?url";
import gsap from "gsap";
import { Sky } from "three/examples/jsm/Addons.js";

// LOCAL TYPES
export interface Lesson34ConstructorProps {
	fileLoader?: THREE.FileLoader;
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_34 {
	folderName = "Lesson 34 | Fireworks";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader;
	textureLoader: THREE.TextureLoader;
	vertexShader?: string;
	fragmentShader?: string;
	configs = {
		uTime: new THREE.Uniform(0),
		uResolution: new THREE.Uniform(
			this.app.renderer.getSize(new THREE.Vector2())
		),
		uPixelRatio: new THREE.Uniform(this.app.renderer.getPixelRatio()),
	};
	textures: THREE.Texture[] = [];

	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	static StaticCreateFirework = () => {};

	constructor(props?: Lesson34ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Construct");

		this.fileLoader = props?.fileLoader ?? new THREE.FileLoader();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

		(async () => {
			this.vertexShader = await this.loadFileString(vertexShaderUrl);
			this.fragmentShader = await this.loadFileString(fragmentShaderUrl);
		})();

		this.textures = [
			this.textureLoader.load(particle1ImgUrl),
			this.textureLoader.load(particle2ImgUrl),
			this.textureLoader.load(particle3ImgUrl),
			this.textureLoader.load(particle4ImgUrl),
			this.textureLoader.load(particle5ImgUrl),
			this.textureLoader.load(particle6ImgUrl),
			this.textureLoader.load(particle7ImgUrl),
			this.textureLoader.load(particle8ImgUrl),
			this.textureLoader.load(particle9ImgUrl),
			this.textureLoader.load(particle10ImgUrl),
			this.textureLoader.load(particle11ImgUrl),
		];

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	async construct() {
		this.gui?.children.forEach((child) => child.destroy());
		if (this.scene) this.destruct();
		if (this.scene) return;

		// Initial Firework
		this.createFirework(100, { x: 0, y: 0, z: 0 });

		// Sky
		const sky = new Sky();
		sky.scale.setScalar(450000);

		const sunPos = new THREE.Vector3();
		const skyEffectController = {
			turbidity: 10,
			rayleigh: 3,
			mieCoefficient: 0.005,
			mieDirectionalG: 0.95,
			elevation: -2.2,
			azimuth: 180,
			exposure: this.app.renderer.toneMappingExposure,
		};

		// Scene
		this.scene = new THREE.Group();
		this.scene.add(sky);
		this.app.scene.add(this.scene);

		// Camera
		this.app.camera.position.set(1.5, 0, 6);

		// Events
		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;
			this.configs.uTime.value = elapsedTime;

			this.configs.uPixelRatio.value = this.app.renderer.getPixelRatio();
			this.app.renderer.getSize(this.configs.uResolution.value);
			this.configs.uResolution.value.x *= this.configs.uPixelRatio.value;
			this.configs.uResolution.value.y *= this.configs.uPixelRatio.value;
		});

		Lesson_34.StaticCreateFirework = () => this.createFirework();
		window.addEventListener("click", Lesson_34.StaticCreateFirework);

		const onSkyGuiChanged = () => {
			const uniforms = sky.material.uniforms;
			uniforms["turbidity"].value = skyEffectController.turbidity;
			uniforms["rayleigh"].value = skyEffectController.rayleigh;
			uniforms["mieCoefficient"].value = skyEffectController.mieCoefficient;
			uniforms["mieDirectionalG"].value = skyEffectController.mieDirectionalG;

			const phi = THREE.MathUtils.degToRad(90 - skyEffectController.elevation);
			const theta = THREE.MathUtils.degToRad(skyEffectController.azimuth);

			sunPos.setFromSphericalCoords(1, phi, theta);

			uniforms["sunPosition"].value.copy(sunPos);
		};

		this.gui
			?.add(skyEffectController, "turbidity", 0.0, 20.0, 0.1)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add(skyEffectController, "rayleigh", 0.0, 4, 0.001)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add(skyEffectController, "mieCoefficient", 0.0, 0.1, 0.001)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add(skyEffectController, "mieDirectionalG", 0.0, 1, 0.001)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add(skyEffectController, "elevation", -3, 90, 0.01)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add(skyEffectController, "azimuth", -180, 180, 0.1)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add(skyEffectController, "exposure", 0, 1, 0.0001)
			.onChange(onSkyGuiChanged);
		this.gui
			?.add({ function: () => this.destruct() }, "function")
			.name("Destruct");
		this.gui?.open();
		onSkyGuiChanged();

		this.onConstruct && this.onConstruct();
	}

	async loadFileString(fileLocation: string) {
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

	createFirework(
		count = Math.round(400 + Math.random() * 1000),
		position: THREE.Vector3Like = {
			x: (Math.random() - 0.5) * 2,
			y: Math.random(),
			z: (Math.random() - 0.5) * 2,
		},
		size = 0.1 + Math.random() * 0.1,
		texture: THREE.Texture = this.textures[
			Math.floor(Math.random() * this.textures.length)
		],
		radius = 0.5 + Math.random(),
		color = (() => {
			const color = new THREE.Color();
			color.setHSL(Math.random(), 1, 0.7);
			return color;
		})()
	) {
		// Geometry
		const positionArray = new Float32Array(count * 3);
		const randomSizeArray = new Float32Array(count);
		const randomTimeMultipliersArray = new Float32Array(count);
		const geometry = new THREE.BufferGeometry();

		for (let i = 0; i < count; i++) {
			const i3 = i * 3;
			const spherical = new THREE.Spherical(
				radius * (0.75 + Math.random() * 0.25),
				Math.random() * Math.PI,
				Math.random() * Math.PI * 2
			);
			const sphericalPosition = new THREE.Vector3().setFromSpherical(spherical);

			positionArray[i3 + 0] = sphericalPosition.x;
			positionArray[i3 + 1] = sphericalPosition.y;
			positionArray[i3 + 2] = sphericalPosition.z;

			randomSizeArray[i] = Math.random();

			randomTimeMultipliersArray[i] = 1 + Math.random();
		}

		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(positionArray, 3)
		);
		geometry.setAttribute(
			"aRandomSize",
			new THREE.Float32BufferAttribute(randomSizeArray, 1)
		);
		geometry.setAttribute(
			"aRandomTimeMultiplier",
			new THREE.Float32BufferAttribute(randomTimeMultipliersArray, 1)
		);

		// Texture
		texture.flipY = false;
		texture.minFilter = THREE.NearestFilter;
		texture.magFilter = THREE.NearestFilter;
		texture.generateMipmaps = false;

		// Material
		const material = new THREE.ShaderMaterial({
			vertexShader: this.vertexShader!,
			fragmentShader: this.fragmentShader!,
			uniforms: {
				uTime: this.configs.uTime,
				uResolution: this.configs.uResolution,
				uPixelRatio: this.configs.uPixelRatio,
				uSize: new THREE.Uniform(size),
				uTexture: new THREE.Uniform(texture),
				uColor: new THREE.Uniform(color),
				uProgress: new THREE.Uniform(0),
			},
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		});

		// Mesh
		const firework = new THREE.Points(geometry, material);
		firework.position.copy(position);
		this.scene?.add(firework);

		gsap.to(material.uniforms.uProgress, {
			value: 1,
			duration: 3,
			ease: "linear",
			onComplete: () => {
				this.scene?.remove(firework);
				geometry.dispose();
				material.dispose();
			},
		});
	}

	destruct() {
		if (!this.scene) return;

		this.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose();
				child.material?.dispose();

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

		window.removeEventListener("click", Lesson_34.StaticCreateFirework);
		this.onDestruct && this.onDestruct();
	}
}
