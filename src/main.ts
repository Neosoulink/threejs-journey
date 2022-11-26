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
import doorAlphaImg from "./assets/img/textures/door/alpha.jpg";
import doorAmbientOcclusionImg from "./assets/img/textures/door/ambientOcclusion.jpg";
import doorDoorImg from "./assets/img/textures/door/color.jpg";
import doorHeightImg from "./assets/img/textures/door/height.jpg";
import doorMetalnessImg from "./assets/img/textures/door/metalness.jpg";
import doorNormalImg from "./assets/img/textures/door/normal.jpg";
import doorRoughnessImg from "./assets/img/textures/door/roughness.jpg";
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
/* Haunted house walls */
import hauntedHouseAmbientocclusionWallImg from "./assets/img/textures/hauntedHouse/bricks/ambientOcclusion.jpg";
import hauntedHouseColorWallImg from "./assets/img/textures/hauntedHouse/bricks/color.jpg";
import hauntedHouseNormalWallImg from "./assets/img/textures/hauntedHouse/bricks/normal.jpg";
import hauntedHouserRoughnessWallImg from "./assets/img/textures/hauntedHouse/bricks/roughness.jpg";
/* Haunted house grass */
import hauntedHouseAmbientocclusionGrassImg from "./assets/img/textures/hauntedHouse/grass/ambientOcclusion.jpg";
import hauntedHouseColorGrassImg from "./assets/img/textures/hauntedHouse/grass/color.jpg";
import hauntedHouseNormalGrassImg from "./assets/img/textures/hauntedHouse/grass/normal.jpg";
import hauntedHouserRoughnessGrassImg from "./assets/img/textures/hauntedHouse/grass/roughness.jpg";
/* Particles */
import particle2Img from "./assets/img/textures/particles/2.png";

// APP
const APP = initThreeJs({
	enableOrbit: true,
	axesSizes: 2,
});

/* DATA */
// let savedTime = Date.now();

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
const DOOR_ALPHA_TEXTURE = TEXTURE_LOADER.load(doorAlphaImg);
const DOOR_AMBIENT_OCCLUSION_TEXTURE = TEXTURE_LOADER.load(
	doorAmbientOcclusionImg
);
const DOOR_COLOR_TEXTURE = TEXTURE_LOADER.load(doorDoorImg);
const DOOR_HEIGHT_TEXTURE = TEXTURE_LOADER.load(doorHeightImg);
const DOOR_METALNESS_TEXTURE = TEXTURE_LOADER.load(doorMetalnessImg);
const DOOR_NORMAL_TEXTURE = TEXTURE_LOADER.load(doorNormalImg);
const DOOR_ROUGHNESS_TEXTURE = TEXTURE_LOADER.load(doorRoughnessImg);
// const GRADIENT_TEXTURE = TEXTURE_LOADER.load(gradientsImg);
// GRADIENT_TEXTURE.minFilter = THREE.NearestFilter;
// GRADIENT_TEXTURE.magFilter = THREE.NearestFilter;
// GRADIENT_TEXTURE.generateMipmaps = false;
const MATCAP_1_TEXTURE = TEXTURE_LOADER.load(matcaps1Img);
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
const TRIANGLE_VERTICES_COUNT = 500;
const TRIANGLE_VERTICES = new Float32Array(TRIANGLE_VERTICES_COUNT * 3 * 3);
/* Fill vector 3 square line */
for (let i = 0; i < TRIANGLE_VERTICES.length; i++) {
	TRIANGLE_VERTICES[i] = (Math.random() - 0.5) * 4;
}
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
const HAUNTED_HOUSE_GRAVES_GROUP = new THREE.Group();
HAUNTED_HOUSE_GROUP.visible = false;

/* TEXTURES */
const HAUNTED_HOUSE_WALLS_AMBIENT_OCCLUSION_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseAmbientocclusionWallImg
);
const HAUNTED_HOUSE_WALLS_COLOR_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseColorWallImg
);
const HAUNTED_HOUSE_WALLS_NORMAL_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseNormalWallImg
);
const HAUNTED_HOUSE_WALLS_ROUGHNESS_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouserRoughnessWallImg
);
const HAUNTED_HOUSE_GRASS_AMBIENT_OCCLUSION_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseAmbientocclusionGrassImg
);
const HAUNTED_HOUSE_GRASS_COLOR_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseColorGrassImg
);
const HAUNTED_HOUSE_GRASS_NORMAL_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseNormalGrassImg
);
const HAUNTED_HOUSE_GRASS_ROUGHNESS_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouserRoughnessGrassImg
);
const HAUNTED_HOUSE_BRUSH_COLOR_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseColorGrassImg
);
const HAUNTED_HOUSE_BRUSH_NORMAL_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouseNormalGrassImg
);
const HAUNTED_HOUSE_BRUSH_ROUGHNESS_TEXTURE = TEXTURE_LOADER.load(
	hauntedHouserRoughnessGrassImg
);
HAUNTED_HOUSE_GRASS_AMBIENT_OCCLUSION_TEXTURE.repeat.set(8, 8);
HAUNTED_HOUSE_GRASS_COLOR_TEXTURE.repeat.set(8, 8);
HAUNTED_HOUSE_GRASS_NORMAL_TEXTURE.repeat.set(8, 8);
HAUNTED_HOUSE_GRASS_ROUGHNESS_TEXTURE.repeat.set(8, 8);

HAUNTED_HOUSE_GRASS_AMBIENT_OCCLUSION_TEXTURE.wrapS = THREE.RepeatWrapping;
HAUNTED_HOUSE_GRASS_COLOR_TEXTURE.wrapS = THREE.RepeatWrapping;
HAUNTED_HOUSE_GRASS_NORMAL_TEXTURE.wrapS = THREE.RepeatWrapping;
HAUNTED_HOUSE_GRASS_ROUGHNESS_TEXTURE.wrapS = THREE.RepeatWrapping;

HAUNTED_HOUSE_GRASS_AMBIENT_OCCLUSION_TEXTURE.wrapT = THREE.RepeatWrapping;
HAUNTED_HOUSE_GRASS_COLOR_TEXTURE.wrapT = THREE.RepeatWrapping;
HAUNTED_HOUSE_GRASS_NORMAL_TEXTURE.wrapT = THREE.RepeatWrapping;
HAUNTED_HOUSE_GRASS_ROUGHNESS_TEXTURE.wrapT = THREE.RepeatWrapping;

/**
 * House
 */
// Walls
const HAUNTED_HOUSE_WALLS = new THREE.Mesh(
	new THREE.BoxGeometry(4, 2.5, 4),
	new THREE.MeshStandardMaterial({
		// color: 0xac8e82,
		aoMap: HAUNTED_HOUSE_WALLS_AMBIENT_OCCLUSION_TEXTURE,
		map: HAUNTED_HOUSE_WALLS_COLOR_TEXTURE,
		normalMap: HAUNTED_HOUSE_WALLS_NORMAL_TEXTURE,
		roughnessMap: HAUNTED_HOUSE_WALLS_ROUGHNESS_TEXTURE,
	})
);
HAUNTED_HOUSE_WALLS.geometry.setAttribute(
	"uv2",
	new THREE.Float32BufferAttribute(
		HAUNTED_HOUSE_WALLS.geometry.attributes.uv.array,
		2
	)
);
HAUNTED_HOUSE_WALLS.position.y = 2.5 / 2;
HAUNTED_HOUSE_WALLS.castShadow = true;
// Roof
const HAUNTED_HOUSE_ROOF = new THREE.Mesh(
	new THREE.ConeBufferGeometry(3.5, 1, 4),
	new THREE.MeshStandardMaterial({
		color: 0xb35e45,
	})
);
HAUNTED_HOUSE_ROOF.position.y = 2.5 + 0.5;
HAUNTED_HOUSE_ROOF.rotation.y = Math.PI * 0.25;
// Door
const HAUNTED_HOUSE_DOOR = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(2.2, 2.2, 100, 100),
	new THREE.MeshStandardMaterial({
		// color: 0xaa7b7b,
		map: DOOR_COLOR_TEXTURE,
		alphaMap: DOOR_ALPHA_TEXTURE,
		aoMap: DOOR_AMBIENT_OCCLUSION_TEXTURE,
		// aoMapIntensity: 1,
		displacementMap: DOOR_HEIGHT_TEXTURE,
		displacementScale: 0.1,
		metalnessMap: DOOR_METALNESS_TEXTURE,
		// metalness: 0.7,
		roughnessMap: DOOR_ROUGHNESS_TEXTURE,
		// roughness: 0.2,
		normalMap: DOOR_NORMAL_TEXTURE,
		// normalScale: new THREE.Vector2(0.5, 0.5),
		transparent: true,
	})
);
HAUNTED_HOUSE_DOOR.geometry.setAttribute(
	"uv2",
	new THREE.Float32BufferAttribute(
		HAUNTED_HOUSE_DOOR.geometry.attributes.uv.array,
		2
	)
);
HAUNTED_HOUSE_DOOR.position.y = 1;
HAUNTED_HOUSE_DOOR.position.z = 2 + 0.0001;
// Bushes
const HAUNTED_HOUSE_BUSH_GEOMETRY = new THREE.SphereGeometry(1, 16, 16);
const HAUNTED_HOUSE_BUSH_MATERIAL = new THREE.MeshStandardMaterial({
	color: "#89c854",
	map: HAUNTED_HOUSE_BRUSH_COLOR_TEXTURE,
	normalMap: HAUNTED_HOUSE_BRUSH_NORMAL_TEXTURE,
	roughnessMap: HAUNTED_HOUSE_BRUSH_ROUGHNESS_TEXTURE,
});

const HAUNTED_HOUSE_BUSH1 = new THREE.Mesh(
	HAUNTED_HOUSE_BUSH_GEOMETRY,
	HAUNTED_HOUSE_BUSH_MATERIAL
);
HAUNTED_HOUSE_BUSH1.scale.set(0.5, 0.5, 0.5);
HAUNTED_HOUSE_BUSH1.position.set(0.8, 0.2, 2.2);

const HAUNTED_HOUSE_BUSH2 = new THREE.Mesh(
	HAUNTED_HOUSE_BUSH_GEOMETRY,
	HAUNTED_HOUSE_BUSH_MATERIAL
);
HAUNTED_HOUSE_BUSH2.scale.set(0.25, 0.25, 0.25);
HAUNTED_HOUSE_BUSH2.position.set(1.4, 0.1, 2.1);

const HAUNTED_HOUSE_BUSH3 = new THREE.Mesh(
	HAUNTED_HOUSE_BUSH_GEOMETRY,
	HAUNTED_HOUSE_BUSH_MATERIAL
);
HAUNTED_HOUSE_BUSH3.scale.set(0.4, 0.4, 0.4);
HAUNTED_HOUSE_BUSH3.position.set(-0.8, 0.1, 2.2);

const HAUNTED_HOUSE_BUSH4 = new THREE.Mesh(
	HAUNTED_HOUSE_BUSH_GEOMETRY,
	HAUNTED_HOUSE_BUSH_MATERIAL
);
HAUNTED_HOUSE_BUSH4.scale.set(0.15, 0.15, 0.15);
HAUNTED_HOUSE_BUSH4.position.set(-1, 0.05, 2.6);

HAUNTED_HOUSE_BUSH1.castShadow = true;
HAUNTED_HOUSE_BUSH2.castShadow = true;
HAUNTED_HOUSE_BUSH3.castShadow = true;
HAUNTED_HOUSE_BUSH4.castShadow = true;
// Graves
const HAUNTED_HOUSE_GRAVE_GEOMETRY = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const HAUNTED_HOUSE_GRAVE_MATERIAL = new THREE.MeshStandardMaterial({
	color: 0xb2b6b1,
});
for (let i = 0; i < 40; i++) {
	const _ANGLE = Math.random() * Math.PI * 2;
	const _RADIUS = 4 + Math.random() * 5;
	const _X = Math.sin(_ANGLE) * _RADIUS;
	const _Y = 0.4;
	const _Z = Math.cos(_ANGLE) * _RADIUS;

	// console.log(_ANGLE, _RADIUS);
	const _GRAVE_MESH = new THREE.Mesh(
		HAUNTED_HOUSE_GRAVE_GEOMETRY,
		HAUNTED_HOUSE_GRAVE_MATERIAL
	);
	_GRAVE_MESH.position.set(_X, _Y, _Z);
	_GRAVE_MESH.rotation.x = (Math.random() - 0.5) * 0.35;
	_GRAVE_MESH.rotation.y = (Math.random() - 0.5) * 0.5;
	_GRAVE_MESH.rotation.z = (Math.random() - 0.5) * 0.3;

	_GRAVE_MESH.castShadow = true;
	HAUNTED_HOUSE_GRAVES_GROUP.add(_GRAVE_MESH);
}

// Floor
const HAUNTED_FLOOR = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial({
		// color: "#a9c388",
		aoMap: HAUNTED_HOUSE_GRASS_AMBIENT_OCCLUSION_TEXTURE,
		map: HAUNTED_HOUSE_GRASS_COLOR_TEXTURE,
		normalMap: HAUNTED_HOUSE_GRASS_NORMAL_TEXTURE,
		roughnessMap: HAUNTED_HOUSE_GRASS_ROUGHNESS_TEXTURE,
	})
);
HAUNTED_FLOOR.geometry.setAttribute(
	"uv2",
	new THREE.Float32BufferAttribute(
		HAUNTED_FLOOR.geometry.attributes.uv.array,
		2
	)
);
HAUNTED_FLOOR.rotation.x = -Math.PI * 0.5;
HAUNTED_FLOOR.position.y = 0;
HAUNTED_FLOOR.receiveShadow = true;

/**
 * Lights
 */
// Ambient light
const HAUNTED_AMBIENT_LIGHT = new THREE.AmbientLight("#b9d5ff", 0.12);

// Directional light
const HAUNTED_MOON_LIGHT = new THREE.DirectionalLight("#b9d5ff", 0.12);
HAUNTED_MOON_LIGHT.position.set(4, 5, -2);
HAUNTED_MOON_LIGHT.castShadow = true;

HAUNTED_MOON_LIGHT.shadow.mapSize.set(256, 256);
HAUNTED_MOON_LIGHT.shadow.camera.far = 15;

// Door light
const HAUNTED_DOOR_LIGHT = new THREE.PointLight("#ff7d46", 1, 7);
HAUNTED_DOOR_LIGHT.position.set(0, 2.2, 2.7);
HAUNTED_DOOR_LIGHT.castShadow = true;
HAUNTED_DOOR_LIGHT.shadow.mapSize.set(256, 256);
HAUNTED_DOOR_LIGHT.shadow.camera.far = 7;

// Ghosts
const HAUNTED_HOUSE_GHOST1 = new THREE.PointLight("#ff00ff", 2, 3);
HAUNTED_HOUSE_GHOST1.castShadow = true;
HAUNTED_HOUSE_GHOST1.shadow.mapSize.set(256, 256);
HAUNTED_HOUSE_GHOST1.shadow.camera.far = 7;
const HAUNTED_HOUSE_GHOST2 = new THREE.PointLight("#00ffff", 2, 3);
HAUNTED_HOUSE_GHOST2.castShadow = true;
HAUNTED_HOUSE_GHOST2.shadow.mapSize.set(256, 256);
HAUNTED_HOUSE_GHOST2.shadow.camera.far = 7;
const HAUNTED_HOUSE_GHOST3 = new THREE.PointLight("#ffff00", 2, 3);
HAUNTED_HOUSE_GHOST3.castShadow = true;
HAUNTED_HOUSE_GHOST3.shadow.mapSize.set(256, 256);
HAUNTED_HOUSE_GHOST3.shadow.camera.far = 7;

HAUNTED_HOUSE_HOUSE_GROUP.add(
	HAUNTED_HOUSE_WALLS,
	HAUNTED_HOUSE_ROOF,
	HAUNTED_HOUSE_DOOR,
	HAUNTED_HOUSE_BUSH1,
	HAUNTED_HOUSE_BUSH2,
	HAUNTED_HOUSE_BUSH3,
	HAUNTED_HOUSE_BUSH4,
	HAUNTED_DOOR_LIGHT
);
HAUNTED_HOUSE_GROUP.add(
	HAUNTED_FLOOR,
	HAUNTED_AMBIENT_LIGHT,
	HAUNTED_MOON_LIGHT,
	HAUNTED_HOUSE_HOUSE_GROUP,
	HAUNTED_HOUSE_GRAVES_GROUP,
	HAUNTED_HOUSE_GHOST1,
	HAUNTED_HOUSE_GHOST2,
	HAUNTED_HOUSE_GHOST3
);

// GUI
const _HAUNTED_HOUSE_GUI = _GUI.addFolder("Haunted house");
_HAUNTED_HOUSE_GUI.close();
_HAUNTED_HOUSE_GUI.add(HAUNTED_HOUSE_GROUP, "visible");
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

/* =========== START PARTICLES =========== */
const PARTICLES_GROUP = new THREE.Group();
PARTICLES_GROUP.visible = false;

/* Circle point */
const PARTICLES_GEOMETRY = new THREE.SphereBufferGeometry(1, 32, 32);
const PARTICLES_MATERIAL = new THREE.PointsMaterial({
	size: 0.02,
	sizeAttenuation: true,
});
const PARTICLES_CIRCLE_POINTS = new THREE.Points(
	PARTICLES_GEOMETRY,
	PARTICLES_MATERIAL
);

/* Custom particles */
const PARTICLES_CUSTOM_VERTICES_COUNT = 400;
const PARTICLES_CUSTOM_VERTICES = new Float32Array(
	PARTICLES_CUSTOM_VERTICES_COUNT * 3
);
const PARTICLES_CUSTOM_VERTICES_COLOR = new Float32Array(
	PARTICLES_CUSTOM_VERTICES_COUNT * 3
);
/* Fill vector 3 square line */
for (let i = 0; i < PARTICLES_CUSTOM_VERTICES.length; i++) {
	PARTICLES_CUSTOM_VERTICES[i] = (Math.random() - 0.5) * 7;
	PARTICLES_CUSTOM_VERTICES_COLOR[i] = Math.random();
}
const PARTICLES_CUSTOM_GEOMETRY = new THREE.BufferGeometry();
PARTICLES_CUSTOM_GEOMETRY.setAttribute(
	"position",
	new THREE.BufferAttribute(PARTICLES_CUSTOM_VERTICES, 3)
);
PARTICLES_CUSTOM_GEOMETRY.setAttribute(
	"color",
	new THREE.BufferAttribute(PARTICLES_CUSTOM_VERTICES_COLOR, 3)
);
const PARTICLES_CUSTOM_TEXTURE = TEXTURE_LOADER.load(particle2Img);
const PARTICLES_CUSTOM_POINT_MATERIAL = new THREE.PointsMaterial({
	color: 0x5aa5ff,
	alphaMap: PARTICLES_CUSTOM_TEXTURE,
	// alphaTest: 0.001,
	// depthTest: false,
	depthWrite: false,
	transparent: true,
	size: 0.1,
	sizeAttenuation: true,
	vertexColors: true,
});
const PARTICLES_CUSTOM_POINTS = new THREE.Points(
	PARTICLES_CUSTOM_GEOMETRY,
	PARTICLES_CUSTOM_POINT_MATERIAL
);

PARTICLES_GROUP.add(PARTICLES_CIRCLE_POINTS, PARTICLES_CUSTOM_POINTS);
/* =========== END PARTICLES =========== */

/* =========== START PARTICLES_GALAXY =========== */
/* DATA */
const PARTICLES_GALAXY_DEFAULT_PARAMS = {
	count: 10000,
	size: 0.01,
	radius: 3,
	branches: 3,
	spin: 1,
	randomness: 0.2,
	randomnessPower: 3,
	insideColor: "#ff6030",
	outsideColor: "#1b3984",
};

/* GROUP */
const PARTICLES_GALAXY_GROUP = new THREE.Group();
PARTICLES_GALAXY_GROUP.visible = false;

/*  */
let particlesGalaxyBufferGeometry: null | THREE.BufferGeometry = null;
let particlesGalaxyMaterial: null | THREE.PointsMaterial = null;
let particlesGalaxyCustomPoints: null | THREE.Points = null;

const generateParticleGalaxy = () => {
	if (
		particlesGalaxyCustomPoints &&
		particlesGalaxyBufferGeometry &&
		particlesGalaxyMaterial
	) {
		particlesGalaxyBufferGeometry.dispose();
		particlesGalaxyMaterial.dispose();
		PARTICLES_GALAXY_GROUP.remove(particlesGalaxyCustomPoints);
	}

	if (!PARTICLES_GALAXY_GROUP.visible) {
		return;
	}

	particlesGalaxyBufferGeometry = new THREE.BufferGeometry();

	const PARTICLES_GALAXY_CUSTOM_VERTICES = new Float32Array(
		PARTICLES_GALAXY_DEFAULT_PARAMS.count * 3
	);
	const PARTICLES_GALAXY_CUSTOM_COLORS = new Float32Array(
		PARTICLES_GALAXY_DEFAULT_PARAMS.count * 3
	);

	const INSIDE_COLOR = new THREE.Color(
		PARTICLES_GALAXY_DEFAULT_PARAMS.insideColor
	);
	const OUTSIDE_COLOR = new THREE.Color(
		PARTICLES_GALAXY_DEFAULT_PARAMS.outsideColor
	);

	/* Fill vector 3 square line */
	for (let i = 0; i < PARTICLES_GALAXY_DEFAULT_PARAMS.count; i++) {
		const _I3 = i * 3;

		/* Positions */
		const _RADIUS = Math.random() * PARTICLES_GALAXY_DEFAULT_PARAMS.radius;
		const _SPIN_ANGLE = _RADIUS * PARTICLES_GALAXY_DEFAULT_PARAMS.spin;
		const _BRANCH_ANGLES =
			((i % PARTICLES_GALAXY_DEFAULT_PARAMS.branches) /
				PARTICLES_GALAXY_DEFAULT_PARAMS.branches) *
			Math.PI *
			2;

		const _RANDOM_X =
			Math.pow(Math.random(), PARTICLES_GALAXY_DEFAULT_PARAMS.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			PARTICLES_GALAXY_DEFAULT_PARAMS.randomness *
			_RADIUS;
		const _RANDOM_Y =
			Math.pow(Math.random(), PARTICLES_GALAXY_DEFAULT_PARAMS.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			PARTICLES_GALAXY_DEFAULT_PARAMS.randomness *
			_RADIUS;
		const _RANDOM_Z =
			Math.pow(Math.random(), PARTICLES_GALAXY_DEFAULT_PARAMS.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			PARTICLES_GALAXY_DEFAULT_PARAMS.randomness *
			_RADIUS;

		PARTICLES_GALAXY_CUSTOM_VERTICES[_I3 + 0] =
			Math.cos(_BRANCH_ANGLES + _SPIN_ANGLE) * _RADIUS + _RANDOM_X;
		PARTICLES_GALAXY_CUSTOM_VERTICES[_I3 + 1] = 0 + _RANDOM_Y;
		PARTICLES_GALAXY_CUSTOM_VERTICES[_I3 + 2] =
			Math.sin(_BRANCH_ANGLES + _SPIN_ANGLE) * _RADIUS + _RANDOM_Z;

		/* Colors */
		const MIXED_COLOR = INSIDE_COLOR.clone();
		MIXED_COLOR.lerp(
			OUTSIDE_COLOR,
			_RADIUS / PARTICLES_GALAXY_DEFAULT_PARAMS.radius
		);

		PARTICLES_GALAXY_CUSTOM_COLORS[_I3 + 0] = MIXED_COLOR.r;
		PARTICLES_GALAXY_CUSTOM_COLORS[_I3 + 1] = MIXED_COLOR.g;
		PARTICLES_GALAXY_CUSTOM_COLORS[_I3 + 2] = MIXED_COLOR.b;
	}

	particlesGalaxyBufferGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(PARTICLES_GALAXY_CUSTOM_VERTICES, 3)
	);

	particlesGalaxyBufferGeometry.setAttribute(
		"color",
		new THREE.BufferAttribute(PARTICLES_GALAXY_CUSTOM_COLORS, 3)
	);

	particlesGalaxyMaterial = new THREE.PointsMaterial({
		size: PARTICLES_GALAXY_DEFAULT_PARAMS.size,
		sizeAttenuation: true,
		depthWrite: true,
		blending: THREE.AdditiveBlending,
		vertexColors: true,
	});

	particlesGalaxyCustomPoints = new THREE.Points(
		particlesGalaxyBufferGeometry,
		particlesGalaxyMaterial
	);
	PARTICLES_GALAXY_GROUP.add(particlesGalaxyCustomPoints);
};

if (PARTICLES_GALAXY_GROUP.visible) {
	generateParticleGalaxy();
}

/* GUI */
const _PARTICLES_GALAXY_FOLDER_GUI = _GUI.addFolder("Particles galaxy");
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_GROUP, "visible")
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "count")
	.min(100)
	.max(100000)
	.step(100)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "size")
	.min(0.001)

	.max(0.1)
	.step(0.001)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "radius")
	.min(0.01)
	.max(20)
	.step(0.01)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "branches")
	.min(2)
	.max(20)
	.step(1)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "spin")
	.min(-5)
	.max(5)
	.step(0.001)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "randomness")
	.min(0)
	.max(2)
	.step(0.001)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.add(PARTICLES_GALAXY_DEFAULT_PARAMS, "randomnessPower")
	.min(3)
	.max(10)
	.step(0.001)
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.addColor(PARTICLES_GALAXY_DEFAULT_PARAMS, "insideColor")
	.onFinishChange(generateParticleGalaxy);
_PARTICLES_GALAXY_FOLDER_GUI
	.addColor(PARTICLES_GALAXY_DEFAULT_PARAMS, "outsideColor")
	.onFinishChange(generateParticleGalaxy);
/* =========== END PARTICLES_GALAXY =========== */

/* =========== START RAY CASTER =========== */
const RAY_CATER_GROUP = new THREE.Group();

const RAY_CASTER_OBJECT_1 = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 16, 16),
	new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
RAY_CASTER_OBJECT_1.position.x = -2;

const RAY_CASTER_OBJECT_2 = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 16, 16),
	new THREE.MeshBasicMaterial({ color: "#ff0000" })
);

const RAY_CASTER_OBJECT_3 = new THREE.Mesh(
	new THREE.SphereGeometry(0.5, 16, 16),
	new THREE.MeshBasicMaterial({ color: "#ff0000" })
);
RAY_CASTER_OBJECT_3.position.x = 2;

const RAY_CASTER_INSTANCE = new THREE.Raycaster(
	new THREE.Vector3(-3, 0, 0),
	new THREE.Vector3(10, 0, 0).normalize()
);

RAY_CATER_GROUP.add(
	RAY_CASTER_OBJECT_1,
	RAY_CASTER_OBJECT_2,
	RAY_CASTER_OBJECT_3
);
/* =========== END RAY CASTER =========== */

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

/* Scene */
APP.scene.add(
	CUBES_GROUP,
	TRIANGLE_MESH,
	MESH_NEW_MATERIAL_GROUP,
	DONUT_GROUP,
	LIGHT_FORMS_GROUP,
	SHADOW_GROUP,
	HAUNTED_HOUSE_GROUP,
	PARTICLES_GROUP,
	PARTICLES_GALAXY_GROUP,
	RAY_CATER_GROUP
);

/* Camera */
APP.camera.position.x = 0;
APP.camera.position.y = 2;
APP.camera.position.z = 10;

/* Control */
APP.control.enableDamping = true;

/* Renderer */
APP.renderer.shadowMap.enabled = true;
APP.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/* Haunted house fog */
APP.scene.fog = HAUNTED_HOUSE_GROUP.visible
	? new THREE.Fog("#262837", 0, 15)
	: null;
APP.renderer.setClearColor(HAUNTED_HOUSE_GROUP.visible ? "#262837" : "#000");

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

	/* haunted house */
	const GHOST1_ANGLE = ELAPSED_TIME * 0.5;
	HAUNTED_HOUSE_GHOST1.position.x = Math.cos(GHOST1_ANGLE) * 4;
	HAUNTED_HOUSE_GHOST1.position.z = Math.sin(GHOST1_ANGLE) * 4;
	HAUNTED_HOUSE_GHOST1.position.y = Math.sin(ELAPSED_TIME * 3);

	const GHOST2_ANGLE = -ELAPSED_TIME * 0.32;
	HAUNTED_HOUSE_GHOST2.position.x = Math.cos(GHOST2_ANGLE) * 5;
	HAUNTED_HOUSE_GHOST2.position.z = Math.sin(GHOST2_ANGLE) * 5;
	HAUNTED_HOUSE_GHOST2.position.y =
		Math.sin(ELAPSED_TIME * 4) + Math.sin(ELAPSED_TIME * 2.5);

	const GHOST3_ANGLE = -ELAPSED_TIME * 0.18;
	HAUNTED_HOUSE_GHOST3.position.x =
		Math.cos(GHOST3_ANGLE) * (7 + Math.sin(ELAPSED_TIME * 0.32));
	HAUNTED_HOUSE_GHOST3.position.z =
		Math.sin(GHOST3_ANGLE) * (7 + Math.sin(ELAPSED_TIME * 0.5));
	HAUNTED_HOUSE_GHOST3.position.y =
		Math.sin(ELAPSED_TIME * 3) + Math.sin(ELAPSED_TIME * 2);

	/* Particles */
	// PARTICLES_CUSTOM_POINTS.rotation.x = ELAPSED_TIME * 0.2;
	// PARTICLES_CUSTOM_POINTS.rotation.y = ELAPSED_TIME * 0.12;
	if (PARTICLES_GROUP.visible) {
		for (let i = 0; i < PARTICLES_CUSTOM_VERTICES_COUNT; i++) {
			const I3 = i * 3;

			const _X = PARTICLES_CUSTOM_GEOMETRY.attributes.position.array[I3];
			// @ts-ignore
			PARTICLES_CUSTOM_GEOMETRY.attributes.position.array[I3 + 1] = Math.sin(
				ELAPSED_TIME + _X
			);
		}
		PARTICLES_CUSTOM_GEOMETRY.attributes.position.needsUpdate = true;
	}

	// Ray caster
	RAY_CASTER_OBJECT_1.position.y = Math.sin(ELAPSED_TIME * 0.3) * 1.5;
	RAY_CASTER_OBJECT_2.position.y = Math.sin(ELAPSED_TIME * 0.8) * 1.5;
	RAY_CASTER_OBJECT_3.position.y = Math.sin(ELAPSED_TIME * 1.4) * 1.5;

	RAY_CASTER_INSTANCE.set(
		new THREE.Vector3(-3, 0, 0),
		new THREE.Vector3(1, 0, 0).normalize()
	);
	const _RAY_CASTER_OBJECTS_ANIMATION = [
		RAY_CASTER_OBJECT_1,
		RAY_CASTER_OBJECT_2,
		RAY_CASTER_OBJECT_3,
	];

	const RAY_CASTER_INSTANCE_INTERSECTS = RAY_CASTER_INSTANCE.intersectObjects(
		_RAY_CASTER_OBJECTS_ANIMATION
	);

	_RAY_CASTER_OBJECTS_ANIMATION.map(
		(item) => (item.material.color = new THREE.Color("#ff0000"))
	);
	RAY_CASTER_INSTANCE_INTERSECTS.map(
		(item) => (item.object.material.color = new THREE.Color("#0000ff"))
	);

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

const _GUI_PARTICLES = _GUI.addFolder("Particles");
_GUI_PARTICLES.add(PARTICLES_GROUP, "visible");

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
