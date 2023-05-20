import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// MODELS
import damagedHelmetGLTF from "../../assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf?url";

// TEXTURES
import nxEnvImg from "../../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../../assets/img/textures/environmentMaps/0/pz.jpg";

export default class Lesson_35 {
	// DATA
	app = new ThreeApp();
	folderName = "Lesson 35 | Mixing HTML and WebGL";
	environmentMapTexture?: THREE.CubeTexture;
	groupContainer?: THREE.Group;
	gui?: GUI;
	GLTF_Loader: GLTFLoader;
	CubeTextureLoader: THREE.CubeTextureLoader;
	fileLoader: THREE.FileLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
	overlayGeometry?: THREE.PlaneGeometry;
	overlayMaterial?: THREE.ShaderMaterial;
	overlayMesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
	sceneReady = false;

	constructor({
		GLTF_Loader = new GLTFLoader(),
		CubeTextureLoader = new THREE.CubeTextureLoader(),
		fileLoader,
		onConstruct,
		onDestruct,
	}: {
		GLTF_Loader?: GLTFLoader;
		CubeTextureLoader?: THREE.CubeTextureLoader;
		fileLoader?: THREE.FileLoader;
		onConstruct?: () => unknown;
		onDestruct?: () => unknown;
	}) {
		this.GLTF_Loader = GLTF_Loader;
		this.CubeTextureLoader = CubeTextureLoader;
		this.onConstruct = onConstruct;
		this.onDestruct = onDestruct;
		this.fileLoader = fileLoader ?? new THREE.FileLoader();

		this.gui = this.app.debug?.ui?.addFolder(this.folderName);
		this.gui?.close();
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
	}

	destroy() {
		if (this.groupContainer) {
			this.app.scene.remove(this.groupContainer);

			this.groupContainer.clear();
			this.groupContainer = undefined;
			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}
			this.overlayGeometry?.dispose();
			this.overlayMaterial?.dispose();

			this.overlayGeometry = undefined;
			this.overlayMaterial = undefined;

			if (this.environmentMapTexture) {
				this.environmentMapTexture.dispose();
				this.environmentMapTexture = undefined;
			}

			if (this.app.updateCallbacks[this.folderName]) {
				delete this.app.updateCallbacks[this.folderName];
			}

			this.app.scene.background = null;
			this.app.scene.environment = null;

			this.app.renderer.toneMapping = THREE.CineonToneMapping;
			this.app.renderer.toneMappingExposure = 1.75;

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

			this.onDestruct && this.onDestruct();
		}
	}

	construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.groupContainer) {
			this.destroy();
		}

		if (!this.groupContainer) {
			this.groupContainer = new THREE.Group();

			// DATA
			const rayCaster = new THREE.Raycaster();
			const debugObject = { envMapIntensity: 2.5 };
			const points: {
				position: THREE.Vector3;
				element: HTMLDivElement | null;
			}[] = [
				{
					position: new THREE.Vector3(1.55, 0.3, -0.6),
					element: document.querySelector(".point-0"),
				},
				{
					position: new THREE.Vector3(0.5, 0.8, -1.6),
					element: document.querySelector(".point-1"),
				},
				{
					position: new THREE.Vector3(1.6, -1.3, -0.7),
					element: document.querySelector(".point-2"),
				},
			];

			// FUNCTIONS
			const updateAllChildMeshEnvMap = () => {
				this.groupContainer?.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						child.material instanceof THREE.MeshStandardMaterial
					) {
						// child.material.envMap = this.environmentMapTexture;
						child.material.envMapIntensity = debugObject.envMapIntensity;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
			};

			this.overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
			this.overlayMaterial = new THREE.ShaderMaterial({
				transparent: true,
				uniforms: {
					uAlpha: { value: 1 },
				},
				vertexShader: `
					void main() {
						gl_Position = vec4(position, 1.0);
					}
				`,
				fragmentShader: `
				uniform float uAlpha;

				void main() {
					gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
				}
				`,
			});
			this.overlayMesh = new THREE.Mesh(
				this.overlayGeometry,
				this.overlayMaterial
			);
			this.groupContainer.add(this.overlayMesh);

			// LIGHTS
			const DIRECTIONAL_LIGHT = new THREE.DirectionalLight("#ffffff", 3);
			DIRECTIONAL_LIGHT.position.set(0.25, 3, -2.25);
			DIRECTIONAL_LIGHT.castShadow = true;
			DIRECTIONAL_LIGHT.shadow.camera.far = 15;
			DIRECTIONAL_LIGHT.shadow.mapSize.set(1024, 1024);
			DIRECTIONAL_LIGHT.shadow.normalBias = 0.05;

			// MODELS
			this.GLTF_Loader.load(damagedHelmetGLTF, (gltf) => {
				gltf.scene.scale.set(2.5, 2.5, 2.5);
				gltf.scene.rotation.y = Math.PI * 0.5;

				this.groupContainer?.add(gltf.scene);

				this.gui
					?.add(gltf.scene.rotation, "y")
					.min(-Math.PI)
					.max(Math.PI)
					.step(0.001)
					.name("Helmet Y rotation");
				this.gui
					?.add(debugObject, "envMapIntensity")
					.min(0)
					.max(10)
					.step(0.001)
					.name("Env Map Intensity")
					.onChange(updateAllChildMeshEnvMap);

				this.gui?.add(this.app.renderer, "toneMapping", {
					No: THREE.NoToneMapping,
					Linear: THREE.LinearToneMapping,
					Reinhard: THREE.ReinhardToneMapping,
					Cineon: THREE.CineonToneMapping,
					ACESFilmic: THREE.ACESFilmicToneMapping,
				});

				this.gui
					?.add(this.app.renderer, "toneMappingExposure")
					.min(0)
					.max(10)
					.step(0.001);

				updateAllChildMeshEnvMap();
			});

			if (!this.environmentMapTexture) {
				this.environmentMapTexture = this.CubeTextureLoader.load([
					pxEnvImg,
					nxEnvImg,
					pyEnvImg,
					nyEnvImg,
					pzEnvImg,
					nzEnvImg,
				]);

				this.app.scene.background = this.environmentMapTexture;
				this.app.scene.environment = this.environmentMapTexture;
			}

			this.app.camera.position.set(4, 1, -4);

			this.app.renderer.toneMapping = THREE.ReinhardToneMapping;
			this.app.renderer.toneMappingExposure = 3;

			this.groupContainer.add(DIRECTIONAL_LIGHT);
			this.app.scene.add(this.groupContainer);

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui
				?.add(DIRECTIONAL_LIGHT, "intensity")
				.min(0)
				.max(10)
				.step(0.001)
				.name("LightIntensity");
			this.gui
				?.add(DIRECTIONAL_LIGHT.position, "x")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightX");
			this.gui
				?.add(DIRECTIONAL_LIGHT.position, "y")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightY");
			this.gui
				?.add(DIRECTIONAL_LIGHT.position, "z")
				.min(-5)
				.max(5)
				.step(0.001)
				.name("LightX");

			this.app.setUpdateCallback(this.folderName, () => {
				if (this.sceneReady) {
					for (const point of points) {
						if (point.element) {
							const screenPosition = point.position.clone();
							screenPosition.project(this.app.camera);

							rayCaster.setFromCamera(screenPosition, this.app.camera);
							const intersects = rayCaster.intersectObjects(
								this.app.scene.children,
								true
							);

							if (intersects.length === 0) {
								point.element?.classList.add("visible");
							} else {
								const intersectionDistance = intersects[0].distance;
								const pointDistance = point.position.distanceTo(
									this.app.camera.position
								);

								if (intersectionDistance < pointDistance) {
									point.element?.classList.remove("visible");
								} else {
									point.element?.classList.add("visible");
								}
							}

							const translateX = screenPosition.x * this.app.sizes.width * 0.5;
							const translateY = -(
								screenPosition.y *
								this.app.sizes.height *
								0.5
							);
							point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
						}
					}
				}
			});

			this.gui?.add({ fn: () => this.destroy() }, "fn").name("Destroy");

			this.onConstruct && this.onConstruct();
		}
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
