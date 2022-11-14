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
/* Shadows */
// import bakedShadowImg from "./assets/img/textures/bakedShadow.jpg";
import simpleShadowImg from "./assets/img/textures/simpleShadow.jpg";

/* DATA */
// let savedTime = Date.now();
const TRIANGLE_VERTICES_COUNT = 500;
const TRIANGLE_VERTICES = new Float32Array(TRIANGLE_VERTICES_COUNT * 3 * 3);
/* Fill vector 3 square line */
for (let i = 0; i < TRIANGLE_VERTICES.length; i++) {
	TRIANGLE_VERTICES[i] = (Math.random() - 0.5) * 4;
}
/* debuggers */
const _GUI = new GUI();

/* CLOCK */
const ANIMATION_CLOCK = new THREE.Clock();

// GROUPE
const MESH_NEW_MATERIAL_GROUP = new THREE.Group();
const DONUT_GROUP = new THREE.Group();
/* Groups properties updates */
MESH_NEW_MATERIAL_GROUP.visible = false;
DONUT_GROUP.visible = false;

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

/**
 * TEXTURES LOADER
 *
 * ? Can load texture with native javascript img class. see the below example
 *
 * ```js
 * const CUBE_IMG = new Image();
 * const DOOR_COLOR_TEXTURE = new THREE.Texture(CUBE_IMG);
 * CUBE_IMG.onload = () => {
 *   DOOR_COLOR_TEXTURE.needsUpdate = true;
 * };
 * CUBE_IMG.src = doorDoorImg;
 * ```
 *
 * ? Otherwise, can load texture using THREE Textures loaders. Most useful :)
 * ? We can apply the ``LoadingManager`` class to see the progress of loading state of textures.
 * ? See the below example
 */
const TEXTURE_LOADER = new THREE.TextureLoader(LOADING_MANAGER);
const CUBE_TEXTURE_LOADER = new THREE.CubeTextureLoader(LOADING_MANAGER);

// TEXTURES
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
const ENVIRONMENT_MAP_TEXTURE = CUBE_TEXTURE_LOADER.load([
	pxEnvImg,
	nxEnvImg,
	pyEnvImg,
	nyEnvImg,
	pzEnvImg,
	nzEnvImg,
]);
// const BAKED_SHADOW = TEXTURE_LOADER.load(bakedShadowImg);
const SIMPLE_SHADOW = TEXTURE_LOADER.load(simpleShadowImg);
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

/* ============ START BASICS =========== */
/* GROUPS */
const CUBES_GROUP = new THREE.Group();
/* Groups visibility */
CUBES_GROUP.visible = false;
/* Groups rotations */
// CUBES_GROUP.rotation.z = 3;

/* MATERIALS */
/* Define Material using MeshBasicMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshBasicMaterial({map: MATCAP_1_TEXTURE});
/* Define Material using MeshNormalMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshNormalMaterial();
/* Define Material using MeshMatcapMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshMatcapMaterial({
// 	matcap: MATCAP_1_TEXTURE,
// });
/* Define Material using MeshDepthMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshDepthMaterial();
/* Define Material using MeshLambertMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshLambertMaterial();
/* Define Material using MeshPhongMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshPhongMaterial();
/* Define Material using MeshToonMaterial */
// const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshToonMaterial({
// 	gradientMap: GRADIENT_TEXTURE,
// });
const TRIANGLE_GEOMETRY = new THREE.BufferGeometry();
const TRIANGLE_MATERIAL = new THREE.MeshBasicMaterial({
	color: 0xff55ee,
	wireframe: true,
});

/* MESH */
const CubeClone = Cube.clone();
const TRIANGLE_MESH = new THREE.Mesh(TRIANGLE_GEOMETRY, TRIANGLE_MATERIAL);

/* Attributes */
TRIANGLE_GEOMETRY.setAttribute(
	"position",
	new THREE.BufferAttribute(TRIANGLE_VERTICES, 3)
);
/* Material */
CubeClone.material.color = new THREE.Color();
CubeClone.material.map = DOOR_COLOR_TEXTURE;
/* Scales */
Cube.scale.set(0.5, 0.5, 0.5);
/* positions */
Cube.position.set(0, 0, 0);
CubeClone.position.set(-3, -1, 0);

/* rotations */
Cube.rotation.reorder("YXZ");
Cube.rotation.set(Math.PI / 5, 3, 3);
CubeClone.rotation.set(Math.PI / 2, -1, 0, "YXZ");
/* Visible */
TRIANGLE_MESH.visible = false;

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

CUBES_GROUP.add(Cube, CubeClone);
/* ============= END BASICS ============= */

/* =========== START LIGHT LESSON =========== */
/* GROUPS */
const LIGHT_FORMS_GROUP = new THREE.Group();
LIGHT_FORMS_GROUP.visible = false;

/* LIGHTS */
const AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.5);
const DIRECTIONAL_LIGHT = new THREE.DirectionalLight(0x00fffc, 0.3);
const HEMISPHERE_LIGHT = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
const POINT_LIGHT = new THREE.PointLight(0xff9000, 0.5, 10, 2);
const RECT_AREA_LIGHT = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
const SPOT_LIGHT = new THREE.SpotLight(
	0x78ff00,
	0.5,
	10,
	Math.PI * 0.1,
	0.25,
	1
);

/* Positions */
DIRECTIONAL_LIGHT.position.set(1, 0.25, 0);
POINT_LIGHT.position.set(1, -0.5, 1);
RECT_AREA_LIGHT.position.set(-1.5, 0, 1.5);
RECT_AREA_LIGHT.lookAt(new THREE.Vector3());
SPOT_LIGHT.position.set(0, 2, 3);
SPOT_LIGHT.target.position.x = -0.75;

/* Light helper */
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
const RECT_AREA_LIGHT_HELPER = new RectAreaLightHelper(RECT_AREA_LIGHT);
window.requestAnimationFrame(() => {
	SPOT_LIGHT_HELPER.update();
});

/* MATERIALS */
const MATERIAL_FOR_LIGHT_PROPOSES = new THREE.MeshStandardMaterial();
const MATER6IAL_FOR_LIGHT_PROPOSES_2 = new THREE.MeshStandardMaterial({
	metalness: 0.7,
	roughness: 0.2,
	envMap: ENVIRONMENT_MAP_TEXTURE,
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

/* Update materials properties */
// MATER6IAL_FOR_LIGHT_PROPOSES_2.shininess = 100;
// MATER6IAL_FOR_LIGHT_PROPOSES_2.specular = new THREE.Color(0xfff00f);
// MATER6IAL_FOR_LIGHT_PROPOSES_2.flatShading = true;
// MATER6IAL_FOR_LIGHT_PROPOSES_2.wireframe = true;
// MATER6IAL_FOR_LIGHT_PROPOSES_2.transparent = true;
// MATER6IAL_FOR_LIGHT_PROPOSES_2.alphaMap = DOOR_ALPHA_TEXTURE;
// MATER6IAL_FOR_LIGHT_PROPOSES_2.side = THREE.DoubleSide;

/* Roughness */
MATERIAL_FOR_LIGHT_PROPOSES.roughness = 0.4;

/* MESH */
const SphereForm = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 64, 64),
	MATER6IAL_FOR_LIGHT_PROPOSES_2
);
const PlaneForm = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1, 100, 100),
	MATER6IAL_FOR_LIGHT_PROPOSES_2
);
const TorusForm = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 64, 128),
	MATER6IAL_FOR_LIGHT_PROPOSES_2
);
const LIGHT_SPHERE = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 32, 32),
	MATERIAL_FOR_LIGHT_PROPOSES
);
const LIGHT_CUBE = new THREE.Mesh(
	new THREE.BoxGeometry(0.75, 0.75, 0.75),
	MATERIAL_FOR_LIGHT_PROPOSES
);
const LIGHT_TORUS = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 32, 64),
	MATERIAL_FOR_LIGHT_PROPOSES
);
const LIGHT_PLANE = new THREE.Mesh(
	new THREE.PlaneGeometry(5, 5),
	MATERIAL_FOR_LIGHT_PROPOSES
);

/* Attributes */
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

/* Positions */
SphereForm.position.set(-2, 3, 0);
PlaneForm.position.set(0, 3, 0);
TorusForm.position.set(2, 3, 0);
LIGHT_SPHERE.position.x = -1.5;
LIGHT_TORUS.position.x = 1.5;
LIGHT_PLANE.rotation.x = -Math.PI * 0.5;
LIGHT_PLANE.position.y = -0.65;
/* =========== END LIGHT LESSON =========== */

/* =========== START SHADOW LESSON =========== */
/* GROUPS */
const SHADOW_GROUP = new THREE.Group();
/* visible */
SHADOW_GROUP.visible = false;

/* LIGHT */
const SHADOW_AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.3);
const SHADOW_DIRECTIONAL_LIGHT = new THREE.DirectionalLight(0xffffff, 0.3);
const SHADOW_SPOT_LIGHT = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3);
const SHADOW_POINT_LIGHT = new THREE.PointLight(0xffffff, 0.3);

/* castShadow */
SHADOW_DIRECTIONAL_LIGHT.castShadow = true;
SHADOW_SPOT_LIGHT.castShadow = true;
SHADOW_POINT_LIGHT.castShadow = true;
/* Position */
SHADOW_DIRECTIONAL_LIGHT.position.set(2, 2, -1);
SHADOW_SPOT_LIGHT.position.set(0, 2, 2);
SHADOW_POINT_LIGHT.position.set(-1, 1, 0);
/* Shadow properties */
SHADOW_DIRECTIONAL_LIGHT.shadow.mapSize.set(1024, 1024);
SHADOW_DIRECTIONAL_LIGHT.shadow.camera.near = 1;
SHADOW_DIRECTIONAL_LIGHT.shadow.camera.far = 6;
SHADOW_DIRECTIONAL_LIGHT.shadow.camera.top = 2;
SHADOW_DIRECTIONAL_LIGHT.shadow.camera.right = 2;
SHADOW_DIRECTIONAL_LIGHT.shadow.camera.bottom = -2;
SHADOW_DIRECTIONAL_LIGHT.shadow.camera.left = -2;
SHADOW_DIRECTIONAL_LIGHT.shadow.radius = 10;
SHADOW_SPOT_LIGHT.shadow.mapSize.set(1024, 1024);
SHADOW_POINT_LIGHT.shadow.mapSize.set(1024, 1024);
SHADOW_POINT_LIGHT.shadow.camera.near = 0.1;
SHADOW_POINT_LIGHT.shadow.camera.far = 4;

/* MATERIAL */
const MATERIAL_FOR_SHADOWS_PROPOSES = new THREE.MeshStandardMaterial();
/* Roughness */
MATERIAL_FOR_SHADOWS_PROPOSES.roughness = 0.7;

/* MESH */
const SHADOW_SPHERE = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 32, 32),
	MATERIAL_FOR_SHADOWS_PROPOSES
);
SHADOW_SPHERE.castShadow = true;

const SHADOW_PLANE = new THREE.Mesh(
	new THREE.PlaneGeometry(5, 5),
	// new THREE.MeshBasicMaterial({ map: BAKED_SHADOW })
	MATERIAL_FOR_SHADOWS_PROPOSES
);
SHADOW_PLANE.rotation.x = -Math.PI * 0.5;
SHADOW_PLANE.position.y = -0.5;
SHADOW_PLANE.receiveShadow = true;

const SHADOW_PLANE_BAKED_SHADOW = new THREE.Mesh(
	new THREE.PlaneGeometry(1.5, 1.5),
	new THREE.MeshBasicMaterial({
		color: 0x000000,
		transparent: true,
		alphaMap: SIMPLE_SHADOW,
	})
);
SHADOW_PLANE_BAKED_SHADOW.rotation.x = -Math.PI * 0.5;
SHADOW_PLANE_BAKED_SHADOW.position.y = SHADOW_PLANE.position.y + 0.01;

// HELPERS
const SHADOW_DIRECTIONAL_LIGHT_CAMERA_HELPER = new THREE.CameraHelper(
	SHADOW_DIRECTIONAL_LIGHT.shadow.camera
);
const SHADOW_SPOT_LIGHT_CAMERA_HELPER = new THREE.CameraHelper(
	SHADOW_SPOT_LIGHT.shadow.camera
);
const SHADOW_POINT_LIGHT_CAMERA_HELPER = new THREE.CameraHelper(
	SHADOW_POINT_LIGHT.shadow.camera
);
SHADOW_DIRECTIONAL_LIGHT_CAMERA_HELPER.visible = false;
SHADOW_SPOT_LIGHT_CAMERA_HELPER.visible = false;
SHADOW_POINT_LIGHT_CAMERA_HELPER.visible = false;
SHADOW_GROUP.add(
	SHADOW_DIRECTIONAL_LIGHT_CAMERA_HELPER,
	SHADOW_SPOT_LIGHT_CAMERA_HELPER,
	SHADOW_POINT_LIGHT_CAMERA_HELPER
);
/* =========== END SHADOW LESSON =========== */

/* =========== START HAUNTED HOUSE =========== */
/* GROUPS */
const HAUNTED_HOUSE_GROUP = new THREE.Group();
const HAUNTED_HOUSE_HOUSE_GROUP = new THREE.Group();

/**
 * House
 */
// Walls
const HAUNTED_HOUSE_WALLS = new THREE.Mesh(
	new THREE.BoxGeometry(4, 2.5, 4),
	new THREE.MeshStandardMaterial({ color: 0xac8e82 })
);
HAUNTED_HOUSE_WALLS.position.y = 2.5 / 2;
// Roof
const HAUNTED_HOUSE_ROOF = new THREE.Mesh(
	new THREE.ConeBufferGeometry(3.5, 1, 4),
	new THREE.MeshStandardMaterial({ color: 0xb35e45 })
);
HAUNTED_HOUSE_ROOF.position.y = 2.5 + 0.5;
HAUNTED_HOUSE_ROOF.rotation.y = Math.PI * 0.25;
// Door
const HAUNTED_HOUSE_DOOR = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(2, 2),
	new THREE.MeshStandardMaterial({ color: 0xaa7b7b })
);
HAUNTED_HOUSE_DOOR.position.y = 1;
HAUNTED_HOUSE_DOOR.position.z = 2 + 0.0001;

// Floor
const HAUNTED_FLOOR = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial({ color: "#a9c388" })
);
HAUNTED_FLOOR.rotation.x = -Math.PI * 0.5;
HAUNTED_FLOOR.position.y = 0;

/**
 * Lights
 */
// Ambient light
const HAUNTED_AMBIENT_LIGHT = new THREE.AmbientLight("#ffffff", 0.5);

// Directional light
const HAUNTED_MOON_LIGHT = new THREE.DirectionalLight("#ffffff", 0.5);
HAUNTED_MOON_LIGHT.position.set(4, 5, -2);

HAUNTED_HOUSE_HOUSE_GROUP.add(
	HAUNTED_HOUSE_WALLS,
	HAUNTED_HOUSE_ROOF,
	HAUNTED_HOUSE_DOOR
);
HAUNTED_HOUSE_GROUP.add(
	HAUNTED_FLOOR,
	HAUNTED_AMBIENT_LIGHT,
	HAUNTED_MOON_LIGHT,
	HAUNTED_HOUSE_HOUSE_GROUP
);

// GUI
const _HAUNTED_HOUSE_GUI = _GUI.addFolder("Haunted house");
_HAUNTED_HOUSE_GUI
	.add(HAUNTED_AMBIENT_LIGHT, "intensity")
	.min(0)
	.max(1)
	.step(0.001);
_HAUNTED_HOUSE_GUI
	.add(HAUNTED_MOON_LIGHT, "intensity")
	.min(0)
	.max(1)
	.step(0.001);
_HAUNTED_HOUSE_GUI
	.add(HAUNTED_MOON_LIGHT.position, "x")
	.min(-5)
	.max(5)
	.step(0.001);
_HAUNTED_HOUSE_GUI
	.add(HAUNTED_MOON_LIGHT.position, "y")
	.min(-5)
	.max(5)
	.step(0.001);
_HAUNTED_HOUSE_GUI
	.add(HAUNTED_MOON_LIGHT.position, "z")
	.min(-5)
	.max(5)
	.step(0.001);

/* =========== END HAUNTED HOUSE =========== */

// ADD TO GROUPE
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
	SHADOW_SPOT_LIGHT,
	SHADOW_SPOT_LIGHT.target,
	SHADOW_POINT_LIGHT,
	SHADOW_PLANE,
	SHADOW_SPHERE,
	SHADOW_PLANE_BAKED_SHADOW
);

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
APP.scene.add(HAUNTED_HOUSE_GROUP);

/* Camera */
APP.camera.position.x = 4;
APP.camera.position.y = 2;
APP.camera.position.z = 5;

/* Control */
APP.control.enableDamping = true;

/* Renderer */
APP.renderer.shadowMap.enabled = false;
APP.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

	SHADOW_SPHERE.position.x = Math.cos(ELAPSED_TIME) * 1.5;
	SHADOW_SPHERE.position.z = Math.sin(ELAPSED_TIME) * 1.5;
	SHADOW_SPHERE.position.y = Math.abs(Math.sin(ELAPSED_TIME * 3) * 1.5);

	SHADOW_PLANE_BAKED_SHADOW.position.x = SHADOW_SPHERE.position.x;
	SHADOW_PLANE_BAKED_SHADOW.position.z = SHADOW_SPHERE.position.z;
	SHADOW_PLANE_BAKED_SHADOW.material.opacity = 1.2 - SHADOW_SPHERE.position.y;

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

	SHADOW_SPOT_LIGHT.shadow.camera.fov = 30;
	SHADOW_SPOT_LIGHT.shadow.camera.near = 1;
	SHADOW_SPOT_LIGHT.shadow.camera.far = 6;

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
_GUI_CUBES_GROUP_FOLDER.close();
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
_GUI_TRIANGLE_MESH_FOLDER.close();
_GUI_TRIANGLE_MESH_FOLDER
	.add(TRIANGLE_MESH, "visible")
	.name("Triangle Mesh Visible");
_GUI_TRIANGLE_MESH_FOLDER
	.add(TRIANGLE_MATERIAL, "wireframe")
	.name("Triangle Wireframe");

const _GUI_NEW_MATERIAL_FOLDER = _GUI.addFolder("New Material props");
_GUI_NEW_MATERIAL_FOLDER.close();
_GUI_NEW_MATERIAL_FOLDER
	.add(MESH_NEW_MATERIAL_GROUP, "visible")
	.name("NEW_MATERIAL_GROUP visible");
_GUI_NEW_MATERIAL_FOLDER
	.add(MATER6IAL_FOR_LIGHT_PROPOSES_2, "metalness")
	.min(0)
	.max(1)
	.step(0.0001);
_GUI_NEW_MATERIAL_FOLDER
	.add(MATER6IAL_FOR_LIGHT_PROPOSES_2, "roughness")
	.min(0)
	.max(1)
	.step(0.0001);

const _GUI_DONUTS_FOLDER = _GUI.addFolder("Donuts");
_GUI_DONUTS_FOLDER.close();
_GUI_DONUTS_FOLDER.add(DONUT_GROUP, "visible").name("Donuts visibility");

const _GUI_LIGHT_FOLDER = _GUI.addFolder("Light");
_GUI_LIGHT_FOLDER.close();
_GUI_LIGHT_FOLDER
	.add(LIGHT_FORMS_GROUP, "visible")
	.name("Lights group visible");

const _GUI_SHADOWS_FOLDER = _GUI.addFolder("Shadows folder");
_GUI_SHADOWS_FOLDER.close();
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
_GUI_SHADOWS_FOLDER
	.add(MATERIAL_FOR_SHADOWS_PROPOSES, "metalness")
	.min(0)
	.max(1)
	.step(0.001);
_GUI_SHADOWS_FOLDER
	.add(MATERIAL_FOR_SHADOWS_PROPOSES, "roughness")
	.min(0)
	.max(1)
	.step(0.001);
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
	if (e.key === "h") {
		if (_GUI._hidden) _GUI.show();
		else _GUI.hide();
	}
});

// window.addEventListener("mousemove", (e) => {
// 	CURSOR_POS.x = e.clientX / APP.sceneSizes.width - 0.5;
// 	CURSOR_POS.y = e.clientY / APP.sceneSizes.height - 0.5;
// });
