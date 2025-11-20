import * as THREE from "three";
import GUI from "lil-gui";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

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

import interfaceNormalMapImg from "../../assets/img/textures/interfaceNormalMap.png";

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
	clock = new THREE.Clock();
	customDisplacementPass?: ShaderPass;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
	resizeEvent?: () => unknown;

	constructor(props?: Lesson32ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
		this.gui?.close();

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

			const customTintPass = new ShaderPass({
				uniforms: {
					tDiffuse: { value: null },
					uTint: { value: null },
				},
				vertexShader: `
					varying vec2 vUv;

					void main()
					{
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

						vUv = uv;
					}
				`,
				fragmentShader: `
					uniform sampler2D tDiffuse;
					uniform vec3 uTint;

					varying vec2 vUv;

					void main()
					{
						vec4 color = texture2D(tDiffuse, vUv);
						color.rgb += uTint;
						gl_FragColor = color;
					}
				`,
			});
			customTintPass.enabled = false;
			customTintPass.material.uniforms.uTint.value = new THREE.Vector3();
			this.effectComposer.addPass(customTintPass);

			this.customDisplacementPass = new ShaderPass({
				uniforms: {
					tDiffuse: { value: null },
					uTime: { value: null },
					uNormalMap: { value: null },
				},
				vertexShader: `
					varying vec2 vUv;

					void main()
					{
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

						vUv = uv;
					}
				`,
				fragmentShader: `
					uniform sampler2D tDiffuse;
					uniform sampler2D uNormalMap;
					uniform float uTime;

					varying vec2 vUv;

					void main()
					{
						vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;

						vec2 newVUv = vec2(
							vUv.x,
							vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1
						) + normalColor.xy * 0.1;
						vec4 color = texture2D(tDiffuse, newVUv);

						vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
						float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);

						color.rgb += lightness * 2.0;

						gl_FragColor = color;
					}
				`,
			});
			this.customDisplacementPass.enabled = false;
			this.customDisplacementPass.material.uniforms.uTime.value = 0;
			this.customDisplacementPass.material.uniforms.uNormalMap.value =
				this.textureLoader.load(interfaceNormalMapImg);

			this.effectComposer.addPass(this.customDisplacementPass);

			const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader);
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
			this.gui?.add(customTintPass, "enabled").name("Custom Tint Pass");
			this.gui
				?.add(customTintPass.material.uniforms.uTint.value, "x")
				.step(0.001)
				.min(0)
				.max(1)
				.name("Custom Tint x");
			this.gui
				?.add(customTintPass.material.uniforms.uTint.value, "y")
				.step(0.001)
				.min(0)
				.max(1)
				.name("Custom Tint y");
			this.gui
				?.add(customTintPass.material.uniforms.uTint.value, "z")
				.step(0.001)
				.min(0)
				.max(1)
				.name("Custom Tint z");
			this.gui
				?.add(this.customDisplacementPass, "enabled")
				.name("Custom Displacement Pass");
			this.gui
				?.add(gammaCorrectionPass, "enabled")
				.name("Gamma Correction Pass");

			SMAA_Pass && this.gui?.add(SMAA_Pass, "enabled").name("SMAA Pass");

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
		if (this.customDisplacementPass?.enabled) {
			const elapsedTime = this.clock.getElapsedTime();
			this.customDisplacementPass.material.uniforms.uTime.value = elapsedTime;
		}
		this.effectComposer?.render();
	}
}
