import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";

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

// LOCAL TYPES
export interface Lesson32ConstructorProps {
	GLTFLoader?: GLTFLoader;
	cubeTextureLoader?: THREE.CubeTextureLoader;
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_32 {
	folderName = "Lesson 32 | Postprocessing";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	gltfLoader: GLTFLoader;
	cubeTextureLoader: THREE.CubeTextureLoader;
	textureLoader: THREE.TextureLoader;
	effectComposer?: EffectComposer;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
	resizeEvent?: () => unknown;

	constructor(props?: Lesson32ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");

		this.gltfLoader = props?.GLTFLoader ?? new GLTFLoader();
		this.cubeTextureLoader =
			props?.cubeTextureLoader ?? new THREE.CubeTextureLoader();
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

			this.app.scene.background = null;
			this.app.scene.environment = null;

			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

			this.resizeEvent && this.app.sizes.off("resize", this.resizeEvent);
			this.app.rendererIntense.enabled = true;
			this.app.renderer.toneMapping = THREE.CineonToneMapping;

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

			// FUNCTIONS
			const updateAllChildMeshEnvMap = () => {
				this.mainGroup?.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						child.material instanceof THREE.MeshStandardMaterial
					) {
						child.material.envMapIntensity = 2.5;
						child.material.needsUpdate = true;
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
			};

			const environmentMap = this.cubeTextureLoader.load([
				pxEnvImg,
				nxEnvImg,
				pyEnvImg,
				nyEnvImg,
				pzEnvImg,
				nzEnvImg,
			]);
			environmentMap.encoding = THREE.sRGBEncoding;

			this.effectComposer = undefined;

			this.app.scene.background = environmentMap;
			this.app.scene.environment = environmentMap;

			/**
			 * Models
			 */
			this.gltfLoader.load(damagedHelmetGLTF, (gltf) => {
				gltf.scene.scale.set(2, 2, 2);
				gltf.scene.rotation.y = Math.PI * 0.5;
				this.mainGroup?.add(gltf.scene);

				updateAllChildMeshEnvMap();
			});

			/**
			 * Lights
			 */
			const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
			directionalLight.castShadow = true;
			directionalLight.shadow.mapSize.set(1024, 1024);
			directionalLight.shadow.camera.far = 15;
			directionalLight.shadow.normalBias = 0.05;
			directionalLight.position.set(0.25, 3, -2.25);
			this.mainGroup?.add(directionalLight);

			// Renderer
			this.app.renderer.toneMapping = THREE.ReinhardToneMapping;

			/**
			 * Renderer target
			 */
			const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
				samples: this.app.renderer.getPixelRatio() === 1 ? 2 : 0,
			});
			console.log("renderTarget ===>", renderTarget);

			/**
			 * Post processing
			 */
			this.effectComposer = new EffectComposer(this.app.renderer);

			this.effectComposer.setPixelRatio(this.app.sizes.pixelRatio);
			this.effectComposer.setSize(this.app.sizes.width, this.app.sizes.height);

			const renderPass = new RenderPass(this.app.scene, this.app.camera);
			this.effectComposer.addPass(renderPass);

			const dotScreenPass = new DotScreenPass();
			dotScreenPass.enabled = false;
			this.effectComposer.addPass(dotScreenPass);

			const glitchPass = new GlitchPass();
			glitchPass.enabled = false;
			this.effectComposer.addPass(glitchPass);

			const rgbShiftPass = new ShaderPass(RGBShiftShader);
			rgbShiftPass.enabled = false;
			this.effectComposer.addPass(rgbShiftPass);

			const unrealBloomPass = new UnrealBloomPass(
				new THREE.Vector2(1, 1),
				0.3,
				1,
				0.6
			);
			unrealBloomPass.enabled = false;
			this.effectComposer.addPass(unrealBloomPass);

			const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
			gammaCorrectionPass.enabled = false;
			this.effectComposer.addPass(gammaCorrectionPass);

			let SMAA_Pass: SMAAPass | undefined = undefined;

			if (
				this.app.renderer.getPixelRatio() === 1 &&
				!this.app.renderer.capabilities.isWebGL2
			) {
				SMAA_Pass = new SMAAPass(this.app.sizes.width, this.app.sizes.height);
				SMAA_Pass.enabled = false;
				this.effectComposer.addPass(SMAA_Pass);
			}

			this.resizeEvent = () => {
				this.effectComposer?.setSize(
					this.app.sizes.width,
					this.app.sizes.height
				);
				this.effectComposer?.setPixelRatio(this.app.sizes.pixelRatio);
			};
			this.app.sizes.on("resize", this.resizeEvent);

			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui?.add(dotScreenPass, "enabled").name("Dot Screen Pass");
			this.gui?.add(glitchPass, "enabled").name("Glitch Pass");
			this.gui?.add(glitchPass, "goWild").name("Glitch Pass Wild");
			SMAA_Pass && this.gui?.add(SMAA_Pass, "enabled").name("SMAA Pass");
			this.gui?.add(rgbShiftPass, "enabled").name("RgbShift Pass");
			this.gui?.add(rgbShiftPass, "enabled").name("RgbShift Pass");
			this.gui?.add(unrealBloomPass, "enabled").name("Unreal Bloom Pass");
			this.gui
				?.add(unrealBloomPass, "strength")
				.step(0.001)
				.min(0)
				.max(2)
				.name("Unreal Bloom strength");
			this.gui
				?.add(unrealBloomPass, "radius")
				.step(0.001)
				.min(0)
				.max(2)
				.name("Unreal Bloom Radius");
			this.gui
				?.add(unrealBloomPass, "threshold")
				.step(0.001)
				.min(0)
				.max(1)
				.name("Unreal Bloom Threshold");

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

		this.app.rendererIntense.enabled = false;
		this.app.setUpdateCallback(this.folderName, () => {
			this.update();
		});

		this.onConstruct && this.onConstruct();
	}

	update() {
		this.effectComposer?.render();
	}
}
