import * as THREE from "three";
// CLASSES
import ThreeApp from "..";

export default class Floor {
	private app: ThreeApp = new ThreeApp();
	geometry: any;
	textures: { color?: THREE.Texture; normal?: THREE.Texture } = {};
	material?: THREE.MeshStandardMaterial;
	mesh?: THREE.Mesh;

	constructor() {
		this.setGeometry();
		this.setTextures();
		this.setMaterial();
		this.setMesh();
	}

	setGeometry() {
		this.geometry = new THREE.CircleGeometry(5, 64);
	}

	setTextures() {
		const _GRASS_COLOR_TEXTURE = this.app.resources.items.grassColorTexture;
		const _GRASS_NORMAL_TEXTURE = this.app.resources.items.grassNormalTexture;

		if (_GRASS_COLOR_TEXTURE instanceof THREE.Texture) {
			this.textures.color = _GRASS_COLOR_TEXTURE;
			this.textures.color.encoding = THREE.sRGBEncoding;
			this.textures.color.repeat.set(1.5, 1.5);
			this.textures.color.wrapS = THREE.RepeatWrapping;
			this.textures.color.wrapT = THREE.RepeatWrapping;
		}

		if (_GRASS_NORMAL_TEXTURE instanceof THREE.Texture) {
			this.textures.normal = _GRASS_NORMAL_TEXTURE;
			this.textures.normal.repeat.set(1.5, 1.5);
			this.textures.normal.wrapS = THREE.RepeatWrapping;
			this.textures.normal.wrapT = THREE.RepeatWrapping;
		}
	}

	setMaterial() {
		this.material = new THREE.MeshStandardMaterial({
			map: this.textures.color,
			normalMap: this.textures.normal,
		});
	}

	setMesh() {
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.rotation.x = -Math.PI * 0.5;
		this.mesh.receiveShadow = true;

		this.app.scene.add(this.mesh);
	}
}
