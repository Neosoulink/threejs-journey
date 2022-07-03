import * as THREE from "three";

const BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);
const BOX_MATERIAL = new THREE.MeshBasicMaterial({ color: 0xff0000 });

export default new THREE.Mesh(BOX_GEOMETRY, BOX_MATERIAL);
