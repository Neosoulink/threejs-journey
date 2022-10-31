import * as THREE from "three";
import GUI from "lil-gui";
import GSAP from "gsap";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";

/* HELPERS */
import initThreeJs from "./helpers/initThreeJs";

/* COMPONENTS */
import Cube from "./components/Cube";

/* STYLES */
import "./assets/css/style.css";

/* FONTS */
import HelvetikerFont from "./assets/fonts/helvetiker/helvetiker_regular.typeface.json?url";

/* IMAGES */
/* Door images */
// import doorAlphaImg from "./assets/img/textures/door/alpha.jpg";
// import doorAmbientOcclusionImg from "./assets/img/textures/door/ambientOcclusion.jpg";
import doorDoorImg from "./assets/img/textures/door/color.jpg";
// import doorHeightImg from "./assets/img/textures/door/height.jpg";
// import doorMetalnessImg from "./assets/img/textures/door/metalness.jpg";
// import doorNormalImg from "./assets/img/textures/door/normal.jpg";
// import doorRoughnessImg from "./assets/img/textures/door/roughness.jpg";

/* Matcaps images */
import matcaps1Img from "./assets/img/textures/matcaps/4.png";

/* Gradients images */
// import gradientsImg from "./assets/img/textures/gradients/5.jpg";

/* Environment map images */
import nxEnvImg from "./assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "./assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "./assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "./assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "./assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "./assets/img/textures/environmentMaps/0/pz.jpg";

/* DATA */
const TRIANGLE_VERTICES_COUNT = 500;
const TRIANGLE_VERTICES = new Float32Array(TRIANGLE_VERTICES_COUNT * 3 * 3);
/* Fill vector 3 square line */
for (let i = 0; i < TRIANGLE_VERTICES.length; i++) {
	TRIANGLE_VERTICES[i] = (Math.random() - 0.5) * 4;
}

/* DEBUGGERS */
const _GUI = new GUI();

// GROUPE
const CUBES_GROUP = new THREE.Group();
const MESH_NEW_MATERIAL_GROUP = new THREE.Group();
const DONUT_GROUP = new THREE.Group();
const LIGHT_FORMS_GROUP = new THREE.Group();
const SHADOW_GROUP = new THREE.Group();

CUBES_GROUP.visible = false;
MESH_NEW_MATERIAL_GROUP.visible = false;
DONUT_GROUP.visible = false;
LIGHT_FORMS_GROUP.visible = false;

/* LOADING MANAGER */
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

/* TEXTURES */
/* Load texture with native javascript img class */
// const CUBE_IMG = new Image();
// const DOOR_COLOR_TEXTURE = new THREE.Texture(CUBE_IMG);
// CUBE_IMG.onload = () => {
// 	DOOR_COLOR_TEXTURE.needsUpdate = true;
// };
// CUBE_IMG.src = doorDoorImg;

/* Load texture using THREE Textures loaders */
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
const MATCAP_1_TEXTURE = TEXTURE_LOADER.load(matcaps1Img);
// const DOOR_HEIGHT_TEXTURE = TEXTURE_LOADER.load(doorHeightImg);
// const DOOR_METALNESS_TEXTURE = TEXTURE_LOADER.load(doorMetalnessImg);
// const DOOR_NORMAL_TEXTURE = TEXTURE_LOADER.load(doorNormalImg);
// const DOOR_ROUGHNESS_TEXTURE = TEXTURE_LOADER.load(doorRoughnessImg);

const ENVIRNEMET_MAP_TEXTURE = CUBE_TEXTURE_LOADER.load([
	pxEnvImg,
	nxEnvImg,
	pyEnvImg,
	nyEnvImg,
	pzEnvImg,
	nzEnvImg,
]);
/* Update texture properties */
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

/* MATERIALS */
/** Define Material using MeshBasicMaterial */
// const NEW_MATER6IAL = new THREE.MeshBasicMaterial({map: MATCAP_1_TEXTURE});

/** Define Material using MeshNormalMaterial */
// const NEW_MATER6IAL = new THREE.MeshNormalMaterial();

/** Define Material using MeshMatcapMaterial */
// const NEW_MATER6IAL = new THREE.MeshMatcapMaterial({
// 	matcap: MATCAP_1_TEXTURE,
// });

/** Define Material using MeshDepthMaterial */
// const NEW_MATER6IAL = new THREE.MeshDepthMaterial();

/** Define Material using MeshLambertMaterial */
// const NEW_MATER6IAL = new THREE.MeshLambertMaterial();

/** Define Material using MeshPhongMaterial */
// const NEW_MATER6IAL = new THREE.MeshPhongMaterial();

/** Define Material using MeshToonMaterial */
// const NEW_MATER6IAL = new THREE.MeshToonMaterial({
// 	gradientMap: GRADIENT_TEXTURE,
// });

/** Define Material using MeshStandardMaterial */
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
const LIGHT_MATERIAL = new THREE.MeshStandardMaterial();
const SHADOW_MATERIAL = new THREE.MeshStandardMaterial();
SHADOW_MATERIAL.roughness = 0.7;

/* Update materials properties */
// NEW_MATER6IAL.shininess = 100;
// NEW_MATER6IAL.specular = new THREE.Color(0xfff00f);
// NEW_MATER6IAL.flatShading = true;
// NEW_MATER6IAL.wireframe = true;
// NEW_MATER6IAL.transparent = true;
// NEW_MATER6IAL.alphaMap = DOOR_ALPHA_TEXTURE;
// NEW_MATER6IAL.side = THREE.DoubleSide;
LIGHT_MATERIAL.roughness = 0.4;

/* MESH */
const CubeClone = Cube.clone();
const SphereForm = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 64, 64),
	NEW_MATER6IAL
);
const PlaneForm = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1, 100, 100),
	NEW_MATER6IAL
);
const TorusForm = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 64, 128),
	NEW_MATER6IAL
);

SphereForm.geometry.setAttribute(
	"uv2",
	new THREE.BufferAttribute(SphereForm.geometry.attributes.uv.array, 2)
);
PlaneForm.geometry.setAttribute(
	"uv2",
	new THREE.BufferAttribute(PlaneForm.geometry.attributes.uv.array, 2)
);
TorusForm.geometry.setAttribute(
	"uv2",
	new THREE.BufferAttribute(TorusForm.geometry.attributes.uv.array, 2)
);

// Light objects
const LIGHT_SPHERE = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 32, 32),
	LIGHT_MATERIAL
);
const LIGHT_CUBE = new THREE.Mesh(
	new THREE.BoxGeometry(0.75, 0.75, 0.75),
	LIGHT_MATERIAL
);
const LIGHT_TORUS = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 32, 64),
	LIGHT_MATERIAL
);
const LIGHT_PLANE = new THREE.Mesh(
	new THREE.PlaneGeometry(5, 5),
	LIGHT_MATERIAL
);

LIGHT_SPHERE.position.x = -1.5;
LIGHT_TORUS.position.x = 1.5;
LIGHT_PLANE.rotation.x = -Math.PI * 0.5;
LIGHT_PLANE.position.y = -0.65;

/* Vector objects */
const TriangleGeometry = new THREE.BufferGeometry();
const TriangleMaterial = new THREE.MeshBasicMaterial({
	color: 0xff55ee,
	wireframe: true,
});
TriangleGeometry.setAttribute(
	"position",
	new THREE.BufferAttribute(TRIANGLE_VERTICES, 3)
);
const TRIANGLE_MESH = new THREE.Mesh(TriangleGeometry, TriangleMaterial);
TRIANGLE_MESH.visible = false;
// let savedTime = Date.now();

/* SHADOW MESH */
const SHADOW_SPHERE = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 32, 32),
	SHADOW_MATERIAL
);

const SHADOW_PLANE = new THREE.Mesh(
	new THREE.PlaneGeometry(5, 5),
	SHADOW_MATERIAL
);
SHADOW_PLANE.rotation.x = -Math.PI * 0.5;
SHADOW_PLANE.position.y = -0.5;

/* UPDATE MESH PROPERTIES */
/* Material */
CubeClone.material.color = new THREE.Color();
CubeClone.material.map = DOOR_COLOR_TEXTURE;

/* Scales */
Cube.scale.set(0.5, 0.5, 0.5);

/* Positions */
Cube.position.set(0, 0, 0);
CubeClone.position.set(-3, -1, 0);
SphereForm.position.set(-2, 3, 0);
PlaneForm.position.set(0, 3, 0);
TorusForm.position.set(2, 3, 0);

/* Rotations */
Cube.rotation.reorder("YXZ");
Cube.rotation.set(Math.PI / 5, 3, 3);
CubeClone.rotation.set(Math.PI / 2, -1, 0, "YXZ");
// CUBES_GROUP.rotation.z = 3;

/* CLOCK */
const ANIMATION_CLOCK = new THREE.Clock();

/* LIGHT */
const AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.5);
const DIRECTIONAL_LIGHT = new THREE.DirectionalLight(0x00fffc, 0.3);
const HEMISPHERE_LIGHT = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
const POINT_LIGHT = new THREE.PointLight(0xff9000, 0.5, 10, 2);
const RECT_AREA_LIGHT = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
const SHADOW_AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.5);
const SHADOW_DIRECTIONAL_LIGHT = new THREE.DirectionalLight(0xffffff, 0.5);
const SPOT_LIGHT = new THREE.SpotLight(
	0x78ff00,
	0.5,
	10,
	Math.PI * 0.1,
	0.25,
	1
);

DIRECTIONAL_LIGHT.position.set(1, 0.25, 0);
POINT_LIGHT.position.set(1, -0.5, 1);
RECT_AREA_LIGHT.position.set(-1.5, 0, 1.5);
RECT_AREA_LIGHT.lookAt(new THREE.Vector3());

SHADOW_DIRECTIONAL_LIGHT.position.set(2, 2, -1);

SPOT_LIGHT.position.set(0, 2, 3);
SPOT_LIGHT.target.position.x = -0.75;

const DIRECTIONAL_LIGHT_HELPER = new THREE.DirectionalLightHelper(
	DIRECTIONAL_LIGHT,
	0.2
);
const HEMISPHERE_LIGHT_HELPER = new THREE.HemisphereLightHelper(
	HEMISPHERE_LIGHT,
	0.2
);
const POINT_LIGHT_HELPER = new THREE.PointLightHelper(POINT_LIGHT, 0.2);
const SPOT_LIGHT_HELPER = new THREE.SpotLightHelper(SPOT_LIGHT);
window.requestAnimationFrame(() => {
	SPOT_LIGHT_HELPER.update();
});
const RECT_AREA_LIGHT_HELPER = new RectAreaLightHelper(RECT_AREA_LIGHT);

// FONTS
const FONT_LOADER = new FontLoader();
FONT_LOADER.load(HelvetikerFont, (font) => {
	const BEVEL_THICKNESS = 0.03;
	const BEVEL_SIZE = 0.02;

	const TEXT_GEOMETRY = new TextGeometry("Three.js", {
		font,
		size: 0.5,
		height: 0.2,
		curveSegments: 6,
		bevelEnabled: true,
		bevelThickness: BEVEL_THICKNESS,
		bevelSize: BEVEL_SIZE,
		bevelOffset: 0,
		bevelSegments: 4,
	});
	TEXT_GEOMETRY.computeBoundingBox();
	// TEXT_GEOMETRY.translate(
	// 	-((TEXT_GEOMETRY.boundingBox?.max.x ?? 1) - BEVEL_SIZE) * 0.5,
	// 	-((TEXT_GEOMETRY.boundingBox?.max.y ?? 1) - BEVEL_SIZE) * 0.5,
	// 	-((TEXT_GEOMETRY.boundingBox?.max.z ?? 1) - BEVEL_THICKNESS) * 0.5
	// );

	TEXT_GEOMETRY.center();

	const MAT_CAP_MATERIAL = new THREE.MeshMatcapMaterial({
		matcap: MATCAP_1_TEXTURE,
	});
	const TEXT_FORM = new THREE.Mesh(TEXT_GEOMETRY, MAT_CAP_MATERIAL);
	const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45);

	TEXT_FORM.visible = false;

	setTimeout(() => {
		const _GUI_TEXT_FOLDER = _GUI.addFolder("Text");

		_GUI_TEXT_FOLDER.add(TEXT_FORM, "visible");
	}, 1000);

	for (let i = 0; i < 100; i++) {
		const donut = new THREE.Mesh(donutGeometry, MAT_CAP_MATERIAL);

		donut.position.x = (Math.random() - 0.5) * 10;
		donut.position.y = (Math.random() - 0.5) * 10;
		donut.position.z = (Math.random() - 0.5) * 10;

		donut.rotation.x = Math.random() * Math.PI;
		donut.rotation.y = Math.random() * Math.PI;

		const CUSTOM_SCALE = Math.random();
		donut.scale.set(CUSTOM_SCALE, CUSTOM_SCALE, CUSTOM_SCALE);

		DONUT_GROUP.add(donut);
	}
	APP.scene.add(TEXT_FORM);
});

// ADD TO GROUPE
CUBES_GROUP.add(Cube, CubeClone);
MESH_NEW_MATERIAL_GROUP.add(SphereForm, PlaneForm, TorusForm);
LIGHT_FORMS_GROUP.add(
	AMBIENT_LIGHT,
	DIRECTIONAL_LIGHT,
	HEMISPHERE_LIGHT,
	POINT_LIGHT,
	RECT_AREA_LIGHT,
	SPOT_LIGHT,
	SPOT_LIGHT.target,
	DIRECTIONAL_LIGHT_HELPER,
	HEMISPHERE_LIGHT_HELPER,
	POINT_LIGHT_HELPER,
	SPOT_LIGHT_HELPER,
	RECT_AREA_LIGHT_HELPER,
	LIGHT_SPHERE,
	LIGHT_CUBE,
	LIGHT_TORUS,
	LIGHT_PLANE
);
SHADOW_GROUP.add(
	SHADOW_AMBIENT_LIGHT,
	SHADOW_DIRECTIONAL_LIGHT,
	SHADOW_PLANE,
	SHADOW_SPHERE
);
SHADOW_GROUP.add();

// APP
const APP = initThreeJs({
	enableOrbit: true,
	axesSizes: 5,
});

/* Scene */
APP.scene.add(CUBES_GROUP);
APP.scene.add(TRIANGLE_MESH);
APP.scene.add(MESH_NEW_MATERIAL_GROUP);
APP.scene.add(DONUT_GROUP);
APP.scene.add(LIGHT_FORMS_GROUP);
APP.scene.add(SHADOW_GROUP);

/* Camera */
APP.camera.position.z = 5;

/* Control */
APP.control.enableDamping = true;

/* Animate */
APP.animate(() => {
	// Animation using native js date
	// const CURRENT_TIME = Date.now();
	// const DELTA_TIME = CURRENT_TIME - savedTime;
	// savedTime = CURRENT_TIME;

	// ANIMATION using THREE clock
	const ELAPSED_TIME = ANIMATION_CLOCK.getElapsedTime();
	CUBES_GROUP.rotation.y = Math.sin(ELAPSED_TIME);
	CUBES_GROUP.rotation.x = Math.cos(ELAPSED_TIME);

	LIGHT_SPHERE.rotation.y = 0.1 * ELAPSED_TIME;
	LIGHT_CUBE.rotation.y = 0.1 * ELAPSED_TIME;
	LIGHT_TORUS.rotation.y = 0.1 * ELAPSED_TIME;

	LIGHT_SPHERE.rotation.x = 0.15 * ELAPSED_TIME;
	LIGHT_CUBE.rotation.x = 0.15 * ELAPSED_TIME;
	LIGHT_TORUS.rotation.x = 0.15 * ELAPSED_TIME;

	// SphereForm.rotation.y = 0.1 * ELAPSED_TIME;
	// PlaneForm.rotation.y = 0.1 * ELAPSED_TIME;
	// TorusForm.rotation.y = 0.1 * ELAPSED_TIME;

	// SphereForm.rotation.x = 0.25 * ELAPSED_TIME;
	// PlaneForm.rotation.x = 0.25 * ELAPSED_TIME;
	// TorusForm.rotation.x = 0.25 * ELAPSED_TIME;

	// CAMERA ANIMATION
	// APP.camera.position.x = Math.sin(CURSOR_POS.x * Math.PI * 2) * 5;
	// APP.camera.position.z = Math.cos(CURSOR_POS.x * Math.PI * 2) * 5;
	// APP.camera.position.y = CURSOR_POS.y * 10;
	// APP.camera.lookAt(new THREE.Vector3());

	// UPDATE CONTROL
	APP.control.update();
});

/* ANIMATIONS */
// GSAP
// GSAP.to(CUBES_GROUP.position, { duration: 0.2, delay: 1, x: 1 });
// GSAP.to(CUBES_GROUP.position, { duration: 0.2, delay: 2, x: 0 });

/* Cursor Animation*/
// const CURSOR_POS = {
// 	x: 0,
// 	y: 0,
// };

/* DEBUGGER UI */
_GUI.close();
const _GUI_CUBES_GROUP_FOLDER = _GUI.addFolder("Cube group");
_GUI_CUBES_GROUP_FOLDER.add(CUBES_GROUP, "visible").name("CUBES_GROUP visible");
_GUI_CUBES_GROUP_FOLDER
	.add(CUBES_GROUP.position, "y")
	.min(-100)
	.max(100)
	.step(0.01);
_GUI_CUBES_GROUP_FOLDER.add(Cube.material, "wireframe").name("Cube wireframe");
_GUI_CUBES_GROUP_FOLDER.addColor(Cube.material, "color").name("Cube color");
_GUI_CUBES_GROUP_FOLDER
	.add(
		{
			function: () => {
				GSAP.to(CubeClone.rotation, {
					duration: 1,
					y: CubeClone.rotation.y + Math.PI * 2,
				});
				GSAP.to(Cube.rotation, {
					duration: 1,
					y: Cube.rotation.y + Math.PI * 2,
				});
			},
		},
		"function"
	)
	.name("Cubes lite animation");

const _GUI_TRIANGLE_MESH_FOLDER = _GUI.addFolder("Triangle");
_GUI_TRIANGLE_MESH_FOLDER
	.add(TRIANGLE_MESH, "visible")
	.name("Triangle Mesh Visible");
_GUI_TRIANGLE_MESH_FOLDER
	.add(TriangleMaterial, "wireframe")
	.name("Triangle Wireframe");

const _GUI_NEW_MATERIAL_FOLDER = _GUI.addFolder("New Material props");
_GUI_NEW_MATERIAL_FOLDER
	.add(MESH_NEW_MATERIAL_GROUP, "visible")
	.name("NEW_MATERIAL_GROUP visible");
_GUI_NEW_MATERIAL_FOLDER
	.add(NEW_MATER6IAL, "metalness")
	.min(0)
	.max(1)
	.step(0.0001);
_GUI_NEW_MATERIAL_FOLDER
	.add(NEW_MATER6IAL, "roughness")
	.min(0)
	.max(1)
	.step(0.0001);

const _GUI_DONUTS_FOLDER = _GUI.addFolder("Donuts");
_GUI_DONUTS_FOLDER.add(DONUT_GROUP, "visible").name("Donuts visibility");

const _GUI_LIGHT_FOLDER = _GUI.addFolder("Light");
_GUI_LIGHT_FOLDER
	.add(LIGHT_FORMS_GROUP, "visible")
	.name("Lights group visible");

const _GUI_SHADOWS_FOLDER = _GUI.addFolder("Shadows folder");
_GUI_SHADOWS_FOLDER.add(SHADOW_GROUP, "visible");
_GUI_SHADOWS_FOLDER
	.add(SHADOW_AMBIENT_LIGHT, "intensity")
	.min(0)
	.max(1)
	.step(0.001);
_GUI_SHADOWS_FOLDER
	.add(SHADOW_DIRECTIONAL_LIGHT, "intensity")
	.min(0)
	.max(1)
	.step(0.001);
_GUI_SHADOWS_FOLDER
	.add(SHADOW_DIRECTIONAL_LIGHT.position, "x")
	.min(-5)
	.max(5)
	.step(0.001);
_GUI_SHADOWS_FOLDER
	.add(SHADOW_DIRECTIONAL_LIGHT.position, "y")
	.min(-5)
	.max(5)
	.step(0.001);
_GUI_SHADOWS_FOLDER
	.add(SHADOW_DIRECTIONAL_LIGHT.position, "z")
	.min(-5)
	.max(5)
	.step(0.001);
_GUI_SHADOWS_FOLDER.add(SHADOW_MATERIAL, "metalness").min(0).max(1).step(0.001);
_GUI_SHADOWS_FOLDER.add(SHADOW_MATERIAL, "roughness").min(0).max(1).step(0.001);
/* JS EVENTS */
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

window.addEventListener("keydown", (e) => {
	console.log("pressend h");
	if (e.key === "h") {
		if (_GUI._hidden) _GUI.show();
		else _GUI.hide();
	}
});

// window.addEventListener("mousemove", (e) => {
// 	CURSOR_POS.x = e.clientX / APP.sceneSizes.width - 0.5;
// 	CURSOR_POS.y = e.clientY / APP.sceneSizes.height - 0.5;
// });
