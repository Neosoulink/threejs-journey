import * as THREE from "three";
import ThreeApp from "..";

export default class Environment {
	private app = new ThreeApp({});
	sunLight = new THREE.DirectionalLight(0xffffffff, 4);

	constructor() {}

	setSunLight() {
		this.sunLight.castShadow = true;
		this.sunLight.shadow.camera.far = 15;
		this.sunLight.shadow.mapSize.set(1024, 1024);
		this.sunLight.shadow.normalBias = 0.05;
		this.sunLight.position.set(3.5, 2, -1.25);
	}
}
