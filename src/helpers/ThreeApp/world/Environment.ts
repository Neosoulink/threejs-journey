import * as THREE from "three";
import GUI from "lil-gui";

// CLASSES
import ThreeApp from "..";

export default class Environment {
	private app = new ThreeApp({});

	sunLight = new THREE.DirectionalLight("#ffffff", 4);
	environmentMap?: {
		intensity: number;
		texture: THREE.CubeTexture;
		updateMaterials?: () => unknown;
	};
	debugFolder?: GUI;

	constructor() {
		// Debug
		if (this.app.debug?.active) {
			this.debugFolder = this.app.debug.ui?.addFolder("environment");
		}

		this.setSunLight();
		this.setEnvironmentMap();
	}

	setSunLight() {
		this.sunLight.castShadow = true;
		this.sunLight.shadow.camera.far = 15;
		this.sunLight.shadow.mapSize.set(1024, 1024);
		this.sunLight.shadow.normalBias = 0.05;
		this.sunLight.position.set(3.5, 2, -1.25);

		this.app.scene.add(this.sunLight);
		// Debug
		if (this.app.debug?.active && this.debugFolder) {
			this.debugFolder
				.add(this.sunLight, "intensity")
				.name("sunLightIntensity")
				.min(0)
				.max(10)
				.step(0.001);

			this.debugFolder
				.add(this.sunLight.position, "x")
				.name("sunLightX")
				.min(-5)
				.max(5)
				.step(0.001);

			this.debugFolder
				.add(this.sunLight.position, "y")
				.name("sunLightY")
				.min(-5)
				.max(5)
				.step(0.001);

			this.debugFolder
				.add(this.sunLight.position, "z")
				.name("sunLightZ")
				.min(-5)
				.max(5)
				.step(0.001);
		}
	}

	setEnvironmentMap() {
		const _TEXTURE = this.app.resources.items["environmentMapTexture"];

		if (_TEXTURE instanceof THREE.CubeTexture) {
			this.environmentMap = {
				intensity: 0.4,
				texture: _TEXTURE,
			};
			this.environmentMap.texture.encoding = THREE.sRGBEncoding;

			this.app.scene.environment = this.environmentMap.texture;

			this.environmentMap.updateMaterials = () => {
				this.app.scene.traverse((child) => {
					if (
						child instanceof THREE.Mesh &&
						child.material instanceof THREE.MeshStandardMaterial &&
						this.environmentMap
					) {
						child.material.envMap = this.environmentMap?.texture;
						child.material.envMapIntensity = this.environmentMap?.intensity;
						child.material.needsUpdate = true;
					}
				});
			};

			this.environmentMap.updateMaterials();
		}

		// Debug
		if (
			this.app.debug?.active &&
			this.debugFolder &&
			this.environmentMap?.updateMaterials
		) {
			this.debugFolder
				.add(this.environmentMap, "intensity")
				.name("envMapIntensity")
				.min(0)
				.max(4)
				.step(0.001)
				.onChange(this.environmentMap.updateMaterials);
		}
	}
}
