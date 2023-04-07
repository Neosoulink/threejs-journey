import * as THREE from "three";
import { GUI } from "lil-gui";
import Cannon from "cannon";

// HELPERS
import initThreeJs from "../helpers/initThreeJs";

/* IMGS */
import gradient3Img from "./assets/img/textures/gradients/3.jpg";

// LOCAL TYPES
export interface ConstructorProps {
	app: ReturnType<typeof initThreeJs>;
	appGui: GUI;
	textureLoader: THREE.TextureLoader;
	onConstruct?: (formsPhysic: {
		worldInstance: Cannon.World;
		spheres: {
			mesh: THREE.Mesh;
			body: Cannon.Body;
		}[];
		boxes: {
			mesh: THREE.Mesh;
			body: Cannon.Body;
		}[];
	}) => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_20 {
	// PROPS
	folderName = "Lesson 20 | Scroll based animation";
	app: ReturnType<typeof initThreeJs>;
	appGui: GUI;
	gui?: GUI;
	groupContainer?: THREE.Group;
	textureLoader: THREE.TextureLoader;

	onDestruct?: () => unknown;

	constructor({ app, appGui, textureLoader, onDestruct }: ConstructorProps) {
		this.app = app;
		this.appGui = appGui;
		this.gui = appGui.addFolder(this.folderName);
		this.gui.add({ function: this.construct }, "function").name("Enable");
		this.onDestruct = onDestruct;
		this.textureLoader = textureLoader;
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

			this.gui = this.appGui.addFolder(this.folderName);
			this.gui.add({ function: this.construct }, "function").name("Enable");

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
			/* Groups */
			this.groupContainer = new THREE.Group();

			/* DATA */
			const SCROLL_BASED_PARAMS = {
				materialColor: "#ffeded",
				objectsDistance: 4,
			};

			/* Groups */
			const SCROLL_BASED_GROUP = new THREE.Group();
			SCROLL_BASED_GROUP.visible = false;

			/* Lights */
			const SCROLL_BASED_DIRECTIONAL_LIGHT = new THREE.DirectionalLight(
				"#ffffff",
				1
			);
			SCROLL_BASED_DIRECTIONAL_LIGHT.position.set(1, 1, 0);

			/* Textures */
			const SCROLL_BASED_GRADIENT_TEXTURE =
				this.textureLoader.load(gradient3Img);
			SCROLL_BASED_GRADIENT_TEXTURE.magFilter = THREE.NearestFilter;

			/* Material */
			const SCROLL_BASED_MATERIAL = new THREE.MeshToonMaterial({
				color: SCROLL_BASED_PARAMS.materialColor,
				gradientMap: SCROLL_BASED_GRADIENT_TEXTURE,
			});

			/* Meshes */
			const SCROLL_BASED_MESH1 = new THREE.Mesh(
				new THREE.TorusGeometry(1, 0.4, 16, 60),
				SCROLL_BASED_MATERIAL
			);
			const SCROLL_BASED_MESH2 = new THREE.Mesh(
				new THREE.ConeGeometry(1, 2, 32),
				SCROLL_BASED_MATERIAL
			);
			const SCROLL_BASED_MESH3 = new THREE.Mesh(
				new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
				SCROLL_BASED_MATERIAL
			);

			const SCROLL_BASED_MESHES_LIST = [
				SCROLL_BASED_MESH1,
				SCROLL_BASED_MESH2,
				SCROLL_BASED_MESH3,
			];

			SCROLL_BASED_MESH1.position.y = -SCROLL_BASED_PARAMS.objectsDistance * 0;
			SCROLL_BASED_MESH2.position.y = -SCROLL_BASED_PARAMS.objectsDistance * 1;
			SCROLL_BASED_MESH3.position.y = -SCROLL_BASED_PARAMS.objectsDistance * 2;
			SCROLL_BASED_MESH1.position.x = 2;
			SCROLL_BASED_MESH2.position.x = -2;
			SCROLL_BASED_MESH3.position.x = 2;

			/**
			 * Particles
			 */
			// Geometry
			const SCROLL_BASED_PARTICLES_COUNT = 200;
			const SCROLL_BASED_PARTICLES_POSITIONS = new Float32Array(
				SCROLL_BASED_PARTICLES_COUNT * 3
			);

			for (let i = 0; i < SCROLL_BASED_PARTICLES_COUNT; i++) {
				SCROLL_BASED_PARTICLES_POSITIONS[i * 3 + 0] =
					(Math.random() - 0.5) * 10;
				SCROLL_BASED_PARTICLES_POSITIONS[i * 3 + 1] =
					SCROLL_BASED_PARAMS.objectsDistance * 0.5 -
					Math.random() *
						SCROLL_BASED_PARAMS.objectsDistance *
						SCROLL_BASED_MESHES_LIST.length;
				SCROLL_BASED_PARTICLES_POSITIONS[i * 3 + 2] =
					(Math.random() - 0.5) * 10;
			}

			const SCROLL_BASED_PARTICLES_GEOMETRY = new THREE.BufferGeometry();
			SCROLL_BASED_PARTICLES_GEOMETRY.setAttribute(
				"position",
				new THREE.BufferAttribute(SCROLL_BASED_PARTICLES_POSITIONS, 3)
			);

			const SCROLL_BASED_PARTICLES_MATERIAL = new THREE.PointsMaterial({
				color: SCROLL_BASED_PARAMS.materialColor,
				sizeAttenuation: true,
				size: 0.03,
			});

			const SCROLL_BASED_PARTICLES_POINTS = new THREE.Points(
				SCROLL_BASED_PARTICLES_GEOMETRY,
				SCROLL_BASED_PARTICLES_MATERIAL
			);

			SCROLL_BASED_GROUP.add(
				SCROLL_BASED_DIRECTIONAL_LIGHT,
				SCROLL_BASED_MESH1,
				SCROLL_BASED_MESH2,
				SCROLL_BASED_MESH3,
				SCROLL_BASED_PARTICLES_POINTS
			);

			this.gui = this.appGui?.addFolder("Scroll based");
			this.gui.close();
			this.gui.add(SCROLL_BASED_GROUP, "visible");

			this.gui.addColor(SCROLL_BASED_PARAMS, "materialColor").onChange(() => {
				SCROLL_BASED_MATERIAL.color.set(SCROLL_BASED_PARAMS.materialColor);
				SCROLL_BASED_PARTICLES_MATERIAL.color.set(
					SCROLL_BASED_PARAMS.materialColor
				);
			});

			document
				.querySelectorAll(".scroll-based-section")
				.forEach((el) => el.classList.remove("d-none"));
			document.getElementById("app")?.classList.add("scroll-based");

			this.app.camera.position.z = 6;
			this.app.camera.fov = 35;
			this.app.camera.updateProjectionMatrix();

		}
	}
}
