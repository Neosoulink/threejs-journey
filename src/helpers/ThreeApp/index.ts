import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// CONSTANTS
import SOURCES from "./sources";

// HELPERS
import Sizes, { sceneSizesType } from "./utils/Sizes";
import Time from "./utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Resources from "./utils/Resoureces";
import Debug from "./utils/Debug";

let intense: ThreeApp;
let tickEvent: () => unknown | undefined;
let resizeEvent: () => unknown | undefined;

export interface initThreeProps {
	enableControls?: boolean;
	axesSizes?: number;
	sceneSizes?: sceneSizesType;
	autoSceneResize?: boolean;
	canvas?: any;
}

export default class ThreeApp {
	private viewPortSizes: sceneSizesType = {
		width: window.innerWidth,
		height: window.innerHeight,
	};
	sceneSizes!: sceneSizesType;
	scene!: THREE.Scene;
	canvas?: HTMLCanvasElement;
	camera2!: Camera;
	rendererIntense!: Renderer;
	control?: OrbitControls;
	sizes!: Sizes;
	time!: Time;
	resources!: Resources;
	debug?: Debug;
	private updateCallbacks: (() => unknown)[] = [];

	constructor(props?: initThreeProps, appDom = "canvas#app") {
		if (intense) {
			return intense;
		}

		intense = this;

		const DOM_APP = document.querySelector<HTMLCanvasElement>(appDom)!;
		const SCENE_SIZES = props?.sceneSizes ?? this.viewPortSizes;
		const SIZES_INSTANCE = new Sizes({
			height: SCENE_SIZES.height,
			width: SCENE_SIZES.width,
			listenResize: props?.autoSceneResize,
		});
		const timeInstance = new Time();

		// SETUP
		this.debug = new Debug();
		this.scene = new THREE.Scene();
		this.sizes = SIZES_INSTANCE;
		this.time = timeInstance;
		this.sceneSizes = {
			height: SIZES_INSTANCE.height,
			width: SIZES_INSTANCE.width,
		};
		this.canvas = DOM_APP;
		this.camera2 = new Camera({ enableControls: !!props?.enableControls });
		this.control = this.camera2.controls;
		this.rendererIntense = new Renderer();
		this.resources = new Resources(SOURCES);

		if (typeof props?.axesSizes === "number") {
			const AXES_HELPER = new THREE.AxesHelper(props?.axesSizes);
			this.scene.add(AXES_HELPER);
		}

		tickEvent = () => {
			this.update();
		};
		resizeEvent = () => {
			this.resize();
		};

		this.time.on("tick", tickEvent);
		this.sizes.on("resize", resizeEvent);
	}

	resize() {
		this.camera2.resize();

		this.rendererIntense.resize();
	}

	update() {
		this.camera2.update();
		this.rendererIntense.update();

		if (this.updateCallbacks.length) {
			this.updateCallbacks.map((callback) => {
				callback();
			});
		}
	}

	destroy() {
		tickEvent && this.time.off("tick", tickEvent);
		resizeEvent && this.sizes.off("resize", resizeEvent);

		// Traverse the whole scene
		this.scene.traverse((child) => {
			// Test if it's a mesh
			if (child instanceof THREE.Mesh) {
				child.geometry.dispose();

				// Loop through the material properties
				for (const key in child.material) {
					const value = child.material[key];

					// Test if there is a dispose function
					if (value && typeof value.dispose === "function") {
						value.dispose();
					}
				}
			}
		});

		this.control?.dispose();
		this.renderer.dispose();

		if (this.debug?.active) this.debug.ui?.destroy();
	}

	get camera() {
		return this.camera2.intense;
	}

	get renderer() {
		return this.rendererIntense.intense;
	}

	set addNewUpdateCallback(callback: () => unknown) {
		this.updateCallbacks.push(callback);
	}
}
