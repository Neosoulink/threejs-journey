import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Sizes, { sceneSizesType } from "./Sizes";
import Time from "./Time";

export interface initThreeProps {
	enableOrbit?: boolean;
	axesSizes?: number;
	sceneSizes?: sceneSizesType;
	control?: OrbitControls;
	autoSceneResize?: boolean;
	canvas?: any;
}

export default class ThreeApp {
	private viewPortSize: sceneSizesType = {
		width: window.innerWidth,
		height: window.innerHeight,
	};
	sceneSizes: sceneSizesType;
	scene: THREE.Scene;
	canvas?: HTMLCanvasElement;
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	control: OrbitControls;
	sizes: Sizes;
	time: Time;

	constructor(props: initThreeProps, appDom = "canvas#app") {
		const DOM_APP = document.querySelector<HTMLCanvasElement>(appDom)!;
		const SCENE_SIZES = props?.sceneSizes ?? this.viewPortSize;
		const SizesInstance = new Sizes({
			sceneSizes: SCENE_SIZES,
			autoSceneResize: props.autoSceneResize,
		});
		const timeInstance = new Time();

		// SETUP
		this.scene = new THREE.Scene();
		this.sizes = SizesInstance;
		this.time = timeInstance;
		this.sceneSizes = SizesInstance.sceneSizes;
		this.camera = new THREE.PerspectiveCamera(
			75,
			SCENE_SIZES.width / SCENE_SIZES.height,
			0.1,
			1000
		);
		this.renderer = new THREE.WebGLRenderer({
			canvas: DOM_APP,
			antialias: true,
			alpha: true,
		});
		this.renderer.setSize(SCENE_SIZES.width, SCENE_SIZES.height);
		this.renderer.setPixelRatio(SizesInstance.pixelRatio);

		/**
		 * Orbit control
		 */
		const ORBIT_CONTROL = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);
		ORBIT_CONTROL.enabled = !!props?.enableOrbit;
		this.control = ORBIT_CONTROL;

		if (typeof props?.axesSizes === "number") {
			const AXES_HELPER = new THREE.AxesHelper(props?.axesSizes);
			this.scene.add(AXES_HELPER);
		}

		if (
			props?.autoSceneResize === undefined ||
			props?.autoSceneResize === true
		) {
			this.sizes.on("resize", (_sceneSizes: sceneSizesType) => {
				this.viewPortSize.width = _sceneSizes.width;
				this.viewPortSize.height = _sceneSizes.height;

				this.camera.aspect = this.viewPortSize.width / this.viewPortSize.height;
				this.camera.updateProjectionMatrix();

				this.renderer.setSize(
					this.viewPortSize.width,
					this.viewPortSize.height
				);
				this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			});
		}

		this.time.on("tick", () => {
			this.update();
		});
	}

	animate(callback: () => unknown = () => {}) {
		this.renderer.render(this.scene, this.camera);

		callback();
		requestAnimationFrame(() => this.animate(callback));
	}

	resize() {}

	update() {}
}
