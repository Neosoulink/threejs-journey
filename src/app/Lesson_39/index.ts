import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// ASSETS
import particleVertexShaderUrl from "./shaders/particles/vertex.glsl?url";
import particleFragmentShaderUrl from "./shaders/particles/fragment.glsl?url";
import particlePictureTextureUrl from "@/assets/img/textures/cursor-particles/picture-1.png?url";
import particleGlowTextureUrl from "@/assets/img/textures/cursor-particles/glow.png?url";

// LOCAL TYPES
export interface Lesson39ConstructorProps {
	fileLoader: THREE.FileLoader;
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export class Lesson_39 {
	folderName = "Lesson 39 | Particles Cursor Animation";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	scene?: THREE.Group;
	fileLoader: THREE.FileLoader = new THREE.FileLoader();
	textureLoader: THREE.TextureLoader;
	canvas2D: {
		element?: HTMLCanvasElement;
		context?: CanvasRenderingContext2D | null;
		glowImage?: HTMLImageElement;
		interactivePlane?: THREE.Mesh;
		raycaster?: THREE.Raycaster;
		screenCursor?: THREE.Vector2;
		canvasCursor?: THREE.Vector2;
		canvasCursorPrevious?: THREE.Vector2;
		texture?: THREE.CanvasTexture;
	} = {};
	configs = {
		uTime: new THREE.Uniform(0),
		uResolution: new THREE.Uniform(
			new THREE.Vector2(
				this.app.sizes.width * this.app.sizes.pixelRatio,
				this.app.sizes.height * this.app.sizes.pixelRatio
			)
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
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;

		this.construct();
	}

	async construct() {
		this.gui?.children.forEach((child) => child.destroy());

		if (this.scene) this.destroy();
		if (this.scene) return;

		this.scene = new THREE.Group();

		// 2D Canvas
		this.canvas2D.element = document.createElement("canvas");
		this.canvas2D.element.width = 128;
		this.canvas2D.element.height = 128;
		this.canvas2D.element.style.position = "fixed";
		this.canvas2D.element.style.top = "60px";
		this.canvas2D.element.style.left = "0px";
		this.canvas2D.element.style.width = "15vw";
		this.canvas2D.element.style.height = "15vw";
		this.canvas2D.element.style.border = "1px solid white";
		this.canvas2D.element.style.zIndex = "10";
		document.body.appendChild(this.canvas2D.element);

		this.canvas2D.context = this.canvas2D.element.getContext("2d");
		this.canvas2D.context?.fillRect(
			0,
			0,
			this.canvas2D.element.width,
			this.canvas2D.element.height
		);

		this.canvas2D.glowImage = new Image();
		this.canvas2D.glowImage.src = particleGlowTextureUrl;

		// Interactive Plane
		this.canvas2D.interactivePlane = new THREE.Mesh(
			new THREE.PlaneGeometry(10, 10),
			new THREE.MeshBasicMaterial({
				color: "red",
				side: THREE.DoubleSide,
			})
		);
		this.canvas2D.interactivePlane.visible = false;

		// Raycaster
		this.canvas2D.raycaster = new THREE.Raycaster();
		this.canvas2D.screenCursor = new THREE.Vector2(9999, 9999);
		this.canvas2D.canvasCursor = this.canvas2D.screenCursor.clone();
		this.canvas2D.canvasCursorPrevious = this.canvas2D.canvasCursor.clone();

		// Texture
		this.canvas2D.texture = new THREE.CanvasTexture(this.canvas2D.element);
		this.canvas2D.texture.minFilter = THREE.LinearFilter;
		this.canvas2D.texture.magFilter = THREE.LinearFilter;
		this.canvas2D.texture.generateMipmaps = false;

		// Particles
		const particleGeometry = new THREE.PlaneGeometry(10, 10, 128, 128);
		particleGeometry.setIndex(null);
		particleGeometry.deleteAttribute("normal");
		const particleIntensityArray = new Float32Array(
			particleGeometry.attributes.position.count
		);
		const particleAngleArray = new Float32Array(
			particleGeometry.attributes.position.count
		);

		for (let i = 0; i < particleGeometry.attributes.position.count; i++) {
			particleIntensityArray[i] = Math.random();
			particleAngleArray[i] = Math.random() * Math.PI * 2;
		}
		particleGeometry.setAttribute(
			"aIntensity",
			new THREE.BufferAttribute(particleIntensityArray, 1)
		);
		particleGeometry.setAttribute(
			"aAngle",
			new THREE.BufferAttribute(particleAngleArray, 1)
		);
		const particleVertexShader = await this.loadFile(particleVertexShaderUrl);
		const particleFragmentShader = await this.loadFile(
			particleFragmentShaderUrl
		);
		const pictureTexture = await this.textureLoader.loadAsync(
			particlePictureTextureUrl
		);
		const particleMaterial = new THREE.ShaderMaterial({
			vertexShader: particleVertexShader,
			fragmentShader: particleFragmentShader,
			side: THREE.DoubleSide,
			transparent: true,
			uniforms: {
				uTime: this.configs.uTime,
				uResolution: this.configs.uResolution,
				uPictureTexture: new THREE.Uniform(pictureTexture),
				uDisplacementTexture: new THREE.Uniform(this.canvas2D.texture),
			},
		});
		const particles = new THREE.Points(particleGeometry, particleMaterial);

		this.scene.add(particles, this.canvas2D.interactivePlane);
		this.app.scene.add(this.scene);

		this.app.camera.position.set(0, 0, 18);

		const onPointerMove = (event: PointerEvent) => {
			this.canvas2D.screenCursor!.x =
				(event.clientX / this.app.sizes.width) * 2 - 1;
			this.canvas2D.screenCursor!.y =
				-(event.clientY / this.app.sizes.height) * 2 + 1;
		};

		window.addEventListener("pointermove", onPointerMove);

		this.app.setUpdateCallback(this.folderName, () => {
			const elapsedTime = this.app.time.elapsed * 0.001;

			this.configs.uTime.value = elapsedTime;
			this.configs.uResolution.value.set(
				this.app.sizes.width * this.app.sizes.pixelRatio,
				this.app.sizes.height * this.app.sizes.pixelRatio
			);

			// Raycaster
			if (this.canvas2D.screenCursor && this.canvas2D.interactivePlane) {
				this.canvas2D.raycaster?.setFromCamera(
					this.canvas2D.screenCursor,
					this.app.camera
				);
				const intersections = this.canvas2D.raycaster?.intersectObject(
					this.canvas2D.interactivePlane
				);
				const intersectedPlane = intersections?.[0];

				if (intersectedPlane && this.canvas2D.screenCursor) {
					const uv = intersectedPlane.uv;

					if (uv && this.canvas2D.element && this.canvas2D.canvasCursor) {
						this.canvas2D.canvasCursor.x = uv.x * this.canvas2D.element.width;
						this.canvas2D.canvasCursor.y =
							(1 - uv.y) * this.canvas2D.element.height;
					}
				}
			}

			// Displacement
			if (
				this.canvas2D.context &&
				this.canvas2D.element &&
				this.canvas2D.glowImage &&
				this.canvas2D.canvasCursor &&
				this.canvas2D.texture
			) {
				const glowSize = this.canvas2D.element.width * 0.25;

				// Fade out
				this.canvas2D.context.globalCompositeOperation = "source-over";
				this.canvas2D.context.globalAlpha = 0.02;
				this.canvas2D.context.fillRect(
					0,
					0,
					this.canvas2D.element.width,
					this.canvas2D.element.height
				);

				// Speed Alpha
				const cursorDistance =
					this.canvas2D.canvasCursorPrevious?.distanceTo(
						this.canvas2D.canvasCursor
					) || 0;
				this.canvas2D.canvasCursorPrevious?.copy(this.canvas2D.canvasCursor);
				const alpha = Math.min(cursorDistance * 0.1, 1);

				// Draw glow
				this.canvas2D.context.globalCompositeOperation = "lighten";
				this.canvas2D.context.globalAlpha = alpha;
				this.canvas2D.context.drawImage(
					this.canvas2D.glowImage,
					this.canvas2D.canvasCursor.x - glowSize * 0.5,
					this.canvas2D.canvasCursor.y - glowSize * 0.5,
					glowSize,
					glowSize
				);

				this.canvas2D.texture.needsUpdate = true;
			}
		});

		this.gui
			?.add(
				{
					function: () => {
						window.removeEventListener("pointermove", onPointerMove);
						this.destroy();
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
				() => {},
				() => rej(undefined)
			);
		});
	}

	destroy() {
		if (!this.scene) return;

		this.canvas2D.element?.remove();
		this.canvas2D.glowImage?.remove();

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
