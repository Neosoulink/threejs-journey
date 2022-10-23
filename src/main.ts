import * as THREE from "three";
import GUI from "lil-gui";
import GSAP from "gsap";

// HELPERS
import initThreeJs from "./helpers/initThreeJs";

// COMPONENTS
import Cube from "./components/Cube";

// STYLES
import "./assets/css/style.css";

// IMAGES
// import doorAlphaImg from "./assets/img/textures/door/alpha.jpg";
// import doorAmbientOcclusionImg from "./assets/img/textures/door/ambientOcclusion.jpg";
// import minecraftImg from "./assets/img/textures/minecraft.png";
import doorDoorImg from "./assets/img/textures/door/color.jpg";
// import doorHeightImg from "./assets/img/textures/door/height.jpg";
// import doorMetalnessImg from "./assets/img/textures/door/metalness.jpg";
// import doorNormalImg from "./assets/img/textures/door/normal.jpg";
// import doorRoughnessImg from "./assets/img/textures/door/roughness.jpg";

// import matcaps1Img from "./assets/img/textures/matcaps/3.png";
// import gradientsImg from "./assets/img/textures/gradients/5.jpg";

import nxEnvImg from "./assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "./assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "./assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "./assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "./assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "./assets/img/textures/environmentMaps/0/pz.jpg";

// DEBUGGER
const _GUI = new GUI();

// DATA
const TRIANGLE_VERTICES_COUNT = 500;
const TRIANGLE_VERTICES = new Float32Array(TRIANGLE_VERTICES_COUNT * 3 * 3);

for (let i = 0; i < TRIANGLE_VERTICES.length; i++) {
	TRIANGLE_VERTICES[i] = (Math.random() - 0.5) * 4;
}

// TEXTURE
// const CUBE_IMG = new Image();
// const DOOR_COLOR_TEXTURE = new THREE.Texture(CUBE_IMG);

// CUBE_IMG.onload = () => {
// 	DOOR_COLOR_TEXTURE.needsUpdate = true;
// };

// CUBE_IMG.src = doorDoorImg;
const LOADING_MANAGER = new THREE.LoadingManager();
LOADING_MANAGER.onStart = () => {
	console.log("on start loading");
};
LOADING_MANAGER.onProgress = () => {
	console.log("On progress");
};
LOADING_MANAGER.onLoad = () => {
	console.log("End loading");
};
LOADING_MANAGER.onError = () => {
	console.log("Error triggered");
};

const TEXTURE_LOADER = new THREE.TextureLoader(LOADING_MANAGER);
const CUBE_TEXTURE_LOADER = new THREE.CubeTextureLoader(LOADING_MANAGER);
// const DOOR_ALPHA_TEXTURE = TEXTURE_LOADER.load(doorAlphaImg);
// const DOOR_AMBIENT_OCCLUSION_TEXTURE = TEXTURE_LOADER.load(
// 	doorAmbientOcclusionImg
// );
const DOOR_COLOR_TEXTURE = TEXTURE_LOADER.load(doorDoorImg);
// const GRADIENT_TEXTURE = TEXTURE_LOADER.load(gradientsImg);
// GRADIENT_TEXTURE.minFilter = THREE.NearestFilter;
// GRADIENT_TEXTURE.magFilter = THREE.NearestFilter;
// GRADIENT_TEXTURE.generateMipmaps = false;
// const SPHERE_1_TEXTURE = TEXTURE_LOADER.load(matcaps1Img);
// const DOOR_HEIGHT_TEXTURE = TEXTURE_LOADER.load(doorHeightImg);
// const DOOR_METALNESS_TEXTURE = TEXTURE_LOADER.load(doorMetalnessImg);
// const DOOR_NORMAL_TEXTURE = TEXTURE_LOADER.load(doorNormalImg);
// const DOOR_ROUGHNESS_TEXTURE = TEXTURE_LOADER.load(doorRoughnessImg);
// DOOR_COLOR_TEXTURE.repeat.x = 2;
// DOOR_COLOR_TEXTURE.repeat.y = 3;

// DOOR_COLOR_TEXTURE.offset.x = 0.5;
// DOOR_COLOR_TEXTURE.offset.y = 0.5;

// DOOR_COLOR_TEXTURE.wrapS = THREE.RepeatWrapping;
// DOOR_COLOR_TEXTURE.wrapT = THREE.RepeatWrapping;

// DOOR_COLOR_TEXTURE.center.x = 0.5;
// DOOR_COLOR_TEXTURE.center.y = 0.5;

// DOOR_COLOR_TEXTURE.rotation = Math.PI / 4;
DOOR_COLOR_TEXTURE.generateMipmaps = false;
DOOR_COLOR_TEXTURE.minFilter = THREE.NearestFilter;
DOOR_COLOR_TEXTURE.magFilter = THREE.NearestFilter;

const ENVIRNEMET_MAP_TEXTURE = CUBE_TEXTURE_LOADER.load([
	pxEnvImg,
	nxEnvImg,
	pyEnvImg,
	nyEnvImg,
	pzEnvImg,
	nzEnvImg,
]);

// FORMS
const CubeClone = Cube.clone();
CubeClone.material.color = new THREE.Color();
CubeClone.material.map = DOOR_COLOR_TEXTURE;
// const NEW_MATER6IAL = new THREE.MeshBasicMaterial({map: SPHERE_1_TEXTURE});
// const NEW_MATER6IAL = new THREE.MeshNormalMaterial();
// const NEW_MATER6IAL = new THREE.MeshMatcapMaterial({
// 	matcap: SPHERE_1_TEXTURE,
// });
// const NEW_MATER6IAL = new THREE.MeshDepthMaterial();
// const NEW_MATER6IAL = new THREE.MeshLambertMaterial();
// const NEW_MATER6IAL = new THREE.MeshPhongMaterial();
// const NEW_MATER6IAL = new THREE.MeshToonMaterial({
// 	gradientMap: GRADIENT_TEXTURE,
// });
const NEW_MATER6IAL = new THREE.MeshStandardMaterial({
	metalness: 0.7,
	roughness: 0.2,
	envMap: ENVIRNEMET_MAP_TEXTURE,
	// map: DOOR_COLOR_TEXTURE,
	// aoMap: DOOR_AMBIENT_OCCLUSION_TEXTURE,
	// aoMapIntensity: 1,
	// displacementMap: DOOR_HEIGHT_TEXTURE,
	// displacementScale: 0.05,
	// metalnessMap: DOOR_METALNESS_TEXTURE,
	// roughnessMap: DOOR_ROUGHNESS_TEXTURE,
	// normalMap: DOOR_NORMAL_TEXTURE,
	// normalScale: new THREE.Vector2(0.5, 0.5),
	// alphaMap: DOOR_ALPHA_TEXTURE,
	// transparent: true,
});

// NEW_MATER6IAL.shininess = 100;
// NEW_MATER6IAL.specular = new THREE.Color(0xfff00f);
// NEW_MATER6IAL.flatShading = true;
// NEW_MATER6IAL.wireframe = true;
// NEW_MATER6IAL.transparent = true;
// NEW_MATER6IAL.alphaMap = DOOR_ALPHA_TEXTURE;
// NEW_MATER6IAL.side = THREE.DoubleSide;

const SPHERE_FORM = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 64, 64),
	NEW_MATER6IAL
);
const PLANE_FORM = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1, 100, 100),
	NEW_MATER6IAL
);

const TORUS_FORM = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 64, 128),
	NEW_MATER6IAL
);
SPHERE_FORM.geometry.setAttribute(
	"uv2",
	new THREE.BufferAttribute(SPHERE_FORM.geometry.attributes.uv.array, 2)
);
PLANE_FORM.geometry.setAttribute(
	"uv2",
	new THREE.BufferAttribute(PLANE_FORM.geometry.attributes.uv.array, 2)
);
TORUS_FORM.geometry.setAttribute(
	"uv2",
	new THREE.BufferAttribute(TORUS_FORM.geometry.attributes.uv.array, 2)
);

const TriangleGeometry = new THREE.BufferGeometry();
const TriangleMaterial = new THREE.MeshBasicMaterial({
	color: 0xff55ee,
	wireframe: true,
});
TriangleGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(TRIANGLE_VERTICES, 3)
);
const TriangleMesh = new THREE.Mesh(TriangleGeometry, TriangleMaterial);
TriangleMesh.visible = false;
const CubesGroup = new THREE.Group();
// let savedTime = Date.now();

// SCALES
Cube.scale.set(0.5, 0.5, 0.5);

// POSITIONS
Cube.position.set(0, 0, 0);
CubeClone.position.set(-3, -1, 0);
SPHERE_FORM.position.set(-2, 3, 0);
PLANE_FORM.position.set(0, 3, 0);
TORUS_FORM.position.set(2, 3, 0);

// ROTATIONS
Cube.rotation.reorder("YXZ");
Cube.rotation.set(Math.PI / 5, 3, 3);
CubeClone.rotation.set(Math.PI / 2, -1, 0, "YXZ");
// CubesGroup.rotation.z = 3;
console.log(Cube);

// GROUPE
CubesGroup.add(Cube, CubeClone);

// CLOCK
const ANIMATION_CLOCK = new THREE.Clock();

// LIGHT
const AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.5);
const POINT_LIGHT = new THREE.PointLight(0xffffff, 0.5);
POINT_LIGHT.position.x = 2;
POINT_LIGHT.position.y = 3;
POINT_LIGHT.position.z = 4;

// APP
const APP = initThreeJs({
	enableOrbit: true,
	axesSizes: 5,
});

APP.scene.add(CubesGroup);
APP.scene.add(TriangleMesh);
APP.scene.add(SPHERE_FORM);
APP.scene.add(PLANE_FORM);
APP.scene.add(TORUS_FORM);
APP.scene.add(AMBIENT_LIGHT);
APP.scene.add(POINT_LIGHT);

//
APP.camera.position.z = 5;

// GSAP
// GSAP.to(CubesGroup.position, { duration: 0.2, delay: 1, x: 1 });
// GSAP.to(CubesGroup.position, { duration: 0.2, delay: 2, x: 0 });

// CURSOR ANIMATION
// const CURSOR_POS = {
// 	x: 0,
// 	y: 0,
// };
// window.addEventListener("mousemove", (e) => {
// 	CURSOR_POS.x = e.clientX / APP.sceneSizes.width - 0.5;
// 	CURSOR_POS.y = e.clientY / APP.sceneSizes.height - 0.5;
// });

window.addEventListener("dblclick", () => {
	const fullscreenElement =
		// @ts-ignore: Safari fix ಥ‿ಥ
		document.fullscreenElement || document.webkitFullscreenElement;

	if (!fullscreenElement) {
		if (APP.canvas.requestFullscreen) {
			APP.canvas.requestFullscreen();
			// @ts-ignore: Safari fix ಥ‿ಥ
		} else if (APP.canvas.webkitRequestFullscreen) {
			// @ts-ignore: Safari fix ಥ‿ಥ
			APP.canvas.webkitRequestFullscreen();
		}
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			// @ts-ignore: Safari fix ಥ‿ಥ
		} else if (document.webkitExitFullscreen) {
			// @ts-ignore: Safari fix ಥ‿ಥ
			document.webkitExitFullscreen();
		}
	}
});

// CONTROLS
_GUI.add(CubesGroup.position, "y").min(-100).max(100).step(0.01);
_GUI.add(TriangleMesh, "visible");
_GUI.add(TriangleMaterial, "wireframe");
_GUI.add(Cube.material, "wireframe");
_GUI.addColor(Cube.material, "color");
_GUI.add(
	{
		function: () => {
			GSAP.to(CubeClone.rotation, {
				duration: 1,
				y: CubeClone.rotation.y + Math.PI * 2,
			});
			GSAP.to(Cube.rotation, { duration: 1, y: Cube.rotation.y + Math.PI * 2 });
		},
	},
	"function"
);
const _GUI_MATERIAL_FOLDER = _GUI.addFolder("New Material props");
_GUI_MATERIAL_FOLDER.add(NEW_MATER6IAL, "metalness").min(0).max(1).step(0.0001);
_GUI_MATERIAL_FOLDER.add(NEW_MATER6IAL, "roughness").min(0).max(1).step(0.0001);

window.addEventListener("keydown", (e) => {
	console.log("pressend h");
	if (e.key === "h") {
		if (_GUI._hidden) _GUI.show();
		else _GUI.hide();
	}
});

APP.control.enableDamping = true;
APP.animate(() => {
	// Animation using native js date
	// const CURRENT_TIME = Date.now();
	// const DELTA_TIME = CURRENT_TIME - savedTime;
	// savedTime = CURRENT_TIME;

	// ANIMATION using THREE clock
	const ELAPSED_TIME = ANIMATION_CLOCK.getElapsedTime();
	CubesGroup.rotation.y = Math.sin(ELAPSED_TIME);
	CubesGroup.rotation.x = Math.cos(ELAPSED_TIME);

	// SPHERE_FORM.rotation.y = 0.1 * ELAPSED_TIME;
	// PLANE_FORM.rotation.y = 0.1 * ELAPSED_TIME;
	// TORUS_FORM.rotation.y = 0.1 * ELAPSED_TIME;

	// SPHERE_FORM.rotation.x = 0.25 * ELAPSED_TIME;
	// PLANE_FORM.rotation.x = 0.25 * ELAPSED_TIME;
	// TORUS_FORM.rotation.x = 0.25 * ELAPSED_TIME;

	// CAMERA ANIMATION
	// APP.camera.position.x = Math.sin(CURSOR_POS.x * Math.PI * 2) * 5;
	// APP.camera.position.z = Math.cos(CURSOR_POS.x * Math.PI * 2) * 5;
	// APP.camera.position.y = CURSOR_POS.y * 10;
	// APP.camera.lookAt(new THREE.Vector3());

	// UPDATE CONTROL
	APP.control.update();
});
