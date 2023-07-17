import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../helpers/ThreeApp";

// MODELS
import FlightHelmetGLTF from "../assets/models/FlightHelmet/glTF/FlightHelmet.gltf?url";

// TEXTURES
import nxEnvImg from "../assets/img/textures/environmentMaps/4/nx.png";
import nyEnvImg from "../assets/img/textures/environmentMaps/4/ny.png";
import nzEnvImg from "../assets/img/textures/environmentMaps/4/nz.png";
import pxEnvImg from "../assets/img/textures/environmentMaps/4/px.png";
import pyEnvImg from "../assets/img/textures/environmentMaps/4/py.png";
import pzEnvImg from "../assets/img/textures/environmentMaps/4/pz.png";

// LOCAL TYPES
export interface Lesson25Props {
	GLTF_Loader?: GLTFLoader;
	CubeTextureLoader?: THREE.CubeTextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

class Lesson_25_Env {
	folderName = "Lesson 25 | Environment map";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	GLTF_Loader: GLTFLoader;
	CubeTextureLoader: THREE.CubeTextureLoader;
	mainGroup?: THREE.Group;
	environmentMapTexture: THREE.CubeTexture | undefined;
	params = { envIntensity: 3 };
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;

	constructor(props: Lesson25Props) {
		this.appGui = this.app.debug?.ui;
		this.GLTF_Loader = props.GLTF_Loader ?? new GLTFLoader();
		this.CubeTextureLoader =
			props.CubeTextureLoader ?? new THREE.CubeTextureLoader();
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
		this.gui?.close();
		this.onConstruct = props?.onConstruct;
		this.onDestruct = props?.onDestruct;
	}

	destroy = () => {
		if (this.mainGroup) {
			this.app.scene.remove(this.mainGroup);

			this.mainGroup.clear();
			this.mainGroup = undefined;
			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.app.scene.background = null;
			this.app.scene.environment = null;
			this.app.scene.backgroundBlurriness = 0;
			this.app.scene.backgroundIntensity = 1;
			this.environmentMapTexture = undefined;

			this.gui = this.app.debug?.ui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

			this.onDestruct && this.onDestruct();
		}
	};

	construct = () => {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.mainGroup) {
			this.destroy();
		}

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
			this.app.scene.backgroundBlurriness = 0.5;
		}

		if (!this.mainGroup) {
			this.mainGroup = new THREE.Group();
			this.gui = this.app.debug?.ui?.addFolder(this.folderName);

			/**
			 * Torus Knot
			 */
			const TORUS_KNOT = new THREE.Mesh(
				new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
				new THREE.MeshStandardMaterial({
					roughness: 0.3,
					metalness: 1,
					envMapIntensity: this.params.envIntensity,
					color: 0xaaaaaa,
				})
			);
			TORUS_KNOT.position.set(-4, 4, 0);

			this.GLTF_Loader.load(FlightHelmetGLTF, (gltf) => {
				gltf.scene.scale.set(10, 10, 10);

				this.updateAllChildMeshEnvMap(gltf.scene);

				this.gui
					?.add(this.params, "envIntensity")
					.min(0)
					.max(10)
					.onChange((res: number) => {
						this.updateAllChildMeshEnvMap(gltf.scene);
						TORUS_KNOT.material.envMapIntensity = Number(res);
					});
				this.gui
					?.add(this.app.scene, "backgroundBlurriness")
					.min(0)
					.max(1)
					.step(0.001);
				this.gui
					?.add(this.app.scene, "backgroundIntensity")
					.min(0)
					.max(10)
					.step(0.001);

				this.mainGroup?.add(gltf.scene);
			});

			this.mainGroup.add(TORUS_KNOT);
			this.app.scene.add(this.mainGroup);

			this.app.camera.position.set(4, 5, 4);
			if (this.app.control) this.app.control.target.y = 3.5;

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");

			this.onConstruct && this.onConstruct();
		}
	};

	updateAllChildMeshEnvMap = (object: THREE.Object3D) => {
		object?.traverse((child) => {
			if (
				child instanceof THREE.Mesh &&
				child.material instanceof THREE.MeshStandardMaterial
			) {
				child.material.envMapIntensity = this.params.envIntensity;
				// child.castShadow = true;
				// child.receiveShadow = true;
			}
		});
	};
}
export default Lesson_25_Env;
