import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// HELPERS
import Sizes, { sceneSizesType } from "./utils/Sizes";
import Time from "./utils/Time";
import Camera from "./Camera";

let intense: ThreeApp;

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
	renderer!: THREE.WebGLRenderer;
	control?: OrbitControls;
	sizes!: Sizes;
	time!: Time;

	constructor(props: initThreeProps, appDom = "canvas#app") {
		if (intense) {
			return intense;
		}

		intense = this;

		const DOM_APP = document.querySelector<HTMLCanvasElement>(appDom)!;
		const SCENE_SIZES = props?.sceneSizes ?? this.viewPortSizes;
		const SIZES_INSTANCE = new Sizes({
			height: SCENE_SIZES.height,
			width: SCENE_SIZES.width,
			listenResize: props.autoSceneResize,
		});
		const timeInstance = new Time();

		// SETUP
		this.scene = new THREE.Scene();
		this.sizes = SIZES_INSTANCE;
		this.time = timeInstance;
		this.sceneSizes = {
			height: SIZES_INSTANCE.height,
			width: SIZES_INSTANCE.width,
		};
		this.renderer = new THREE.WebGLRenderer({
			canvas: DOM_APP,
			antialias: true,
			alpha: true,
		});
		this.canvas = DOM_APP;
		this.renderer.setSize(SCENE_SIZES.width, SCENE_SIZES.height);
		this.renderer.setPixelRatio(SIZES_INSTANCE.pixelRatio);
		this.camera2 = new Camera({ enableControls: !!props.enableControls });
		this.control = this.camera2.controls;

		if (typeof props?.axesSizes === "number") {
			const AXES_HELPER = new THREE.AxesHelper(props?.axesSizes);
			this.scene.add(AXES_HELPER);
		}

		this.time.on("tick", () => {
			this.update();
		});

		this.sizes.on("resize", () => {
			this.resize();
		});
	}

	animate(callback: () => unknown = () => {}) {
		this.renderer.render(this.scene, this.camera);

		callback();
		requestAnimationFrame(() => this.animate(callback));
	}

	resize() {
		this.camera2.resize();

		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	update() {
		this.camera2.update();
	}

	get camera() {
		return this.camera2.intense;
	}
}
