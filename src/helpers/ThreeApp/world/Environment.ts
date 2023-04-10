import * as THREE from "three";

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

	constructor() {
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
	}
}
