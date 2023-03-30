import * as THREE from "three";
import { GUI } from "lil-gui";
import Cannon, { Vec3 } from "cannon";

// HELPERS
import initThreeJs from "../helpers/initThreeJs";

// TEXTURES
import nxEnvImg from "../assets/img/textures/environmentMaps/0/nx.jpg";
import nyEnvImg from "../assets/img/textures/environmentMaps/0/ny.jpg";
import nzEnvImg from "../assets/img/textures/environmentMaps/0/nz.jpg";
import pxEnvImg from "../assets/img/textures/environmentMaps/0/px.jpg";
import pyEnvImg from "../assets/img/textures/environmentMaps/0/py.jpg";
import pzEnvImg from "../assets/img/textures/environmentMaps/0/pz.jpg";

// SOUNDS
import tocSound from "../assets/sounds/hit.mp3";

export default ({
	app,
	appGui,
	CubeTextureLoader = new THREE.CubeTextureLoader(),
	onConstruct,
	onDestruct,
}: {
	app: ReturnType<typeof initThreeJs>;
	appGui: GUI;
	CubeTextureLoader: THREE.CubeTextureLoader;
	onConstruct?: (formsPhysic: {
		worldInstance: Cannon.World;
		spheres: {
			mesh: THREE.Mesh;
			body: Cannon.Body;
		}[];
		boxes: {
			mesh: THREE.Mesh;
			body: Cannon.Body;
		}[];
	}) => unknown;
	onDestruct?: () => unknown;
}) => {
	// DATA
	const FOLDER_NAME = "Lesson 21 | Physic world";

	let _GUI: typeof appGui | undefined = appGui.addFolder(FOLDER_NAME);
	let physicWorldTocSound: HTMLAudioElement | undefined;
	let environmentMapTexture: THREE.CubeTexture | undefined;
	let groupContainer: THREE.Group | undefined;
	let physicWorld: Cannon.World | undefined;

	const destroy = () => {
		if (groupContainer) {
			app.scene.remove(groupContainer);

			groupContainer.clear();
			groupContainer = undefined;
			if (_GUI) {
				_GUI.destroy();
				_GUI = undefined;
			}

			_GUI = appGui.addFolder(FOLDER_NAME);
			_GUI.add({ function: construct }, "function").name("Enable");

			onDestruct && onDestruct();
		}
	};

	const construct = () => {
		if (_GUI) {
			_GUI.destroy();
			_GUI = undefined;
		}

		if (groupContainer) {
			destroy();
		}

		if (!groupContainer) {
			/* Groups */
			groupContainer = new THREE.Group();

			if (!physicWorldTocSound) {
				physicWorldTocSound = new Audio(tocSound);
			}

			if (!environmentMapTexture) {
				environmentMapTexture = CubeTextureLoader.load([
					pxEnvImg,
					nxEnvImg,
					pyEnvImg,
					nyEnvImg,
					pzEnvImg,
					nzEnvImg,
				]);
			}

			/* World */
			physicWorld = new Cannon.World();
			physicWorld.broadphase = new Cannon.SAPBroadphase(physicWorld);
			physicWorld.allowSleep = true;
			physicWorld.gravity.set(0, -9.82, 0);

			/* Physic Materials */
			const PHYSICS_WORLD_DEFAULT_MATERIAL = new Cannon.Material("default");

			const PHYSICS_WORLD_DEFAULT_CONTACT_MATERIAL = new Cannon.ContactMaterial(
				PHYSICS_WORLD_DEFAULT_MATERIAL,
				PHYSICS_WORLD_DEFAULT_MATERIAL,
				{
					friction: 0.1,
					restitution: 0.7,
				}
			);

			/* Objects */
			// const PHYSICS_WORLD_SPHERE_PHYSIC_SHAPE = new Cannon.Sphere(0.5);
			// const PHYSICS_WORLD_SPHERE_PHYSIC_BODY = new Cannon.Body({
			// 	mass: 1,
			// 	position: new Cannon.Vec3(0, 3, 0),
			// 	shape: PHYSICS_WORLD_SPHERE_PHYSIC_SHAPE,
			// });

			const PHYSICS_WORLD_FLOOR_PHYSIC_SHAPE = new Cannon.Plane();
			const PHYSICS_WORLD_FLOOR_PHYSIC_BODY = new Cannon.Body();
			PHYSICS_WORLD_FLOOR_PHYSIC_BODY.quaternion.setFromAxisAngle(
				new Cannon.Vec3(-1, 0, 0),
				Math.PI * 0.5
			);
			PHYSICS_WORLD_FLOOR_PHYSIC_BODY.mass = 0;
			PHYSICS_WORLD_FLOOR_PHYSIC_BODY.addShape(
				PHYSICS_WORLD_FLOOR_PHYSIC_SHAPE
			);

			/* Forces */
			// PHYSICS_WORLD_SPHERE_PHYSIC_BODY.applyLocalForce(
			// 	new Cannon.Vec3(150, 0, 0),
			// 	new Cannon.Vec3(0, 0, 0)
			// );

			physicWorld.addContactMaterial(PHYSICS_WORLD_DEFAULT_CONTACT_MATERIAL);
			physicWorld.defaultContactMaterial =
				PHYSICS_WORLD_DEFAULT_CONTACT_MATERIAL;
			// physicWorld.addBody(PHYSICS_WORLD_SPHERE_PHYSIC_BODY);
			physicWorld.addBody(PHYSICS_WORLD_FLOOR_PHYSIC_BODY);

			/* Geometries */
			const PHYSIC_WORLD_SPHERE_GEOMETRY = new THREE.SphereGeometry(1, 20, 20);
			const PHYSIC_WORLD_BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);

			/* Materials */
			const PHYSIC_WORLD_DEFAULT_MATERIAL = new THREE.MeshStandardMaterial({
				metalness: 0.3,
				roughness: 0.4,
				envMap: environmentMapTexture,
				envMapIntensity: 0.5,
			});
			/* Meshes */
			/* Sphere */
			// const PHYSICS_WORLD_SPHERE = new THREE.Mesh(
			// 	new THREE.SphereGeometry(0.5, 32, 32),
			// 	PHYSIC_WORLD_DEFAULT_MATERIAL
			// );
			// PHYSICS_WORLD_SPHERE.castShadow = true;
			// PHYSICS_WORLD_SPHERE.position.y = 0.5;

			/* Floor */
			const PHYSICS_WORLD_FLOOR = new THREE.Mesh(
				new THREE.PlaneGeometry(10, 10),
				new THREE.MeshStandardMaterial({
					color: "#777777",
					metalness: 0.3,
					roughness: 0.4,
					envMap: environmentMapTexture,
					envMapIntensity: 0.5,
				})
			);
			PHYSICS_WORLD_FLOOR.receiveShadow = true;
			PHYSICS_WORLD_FLOOR.rotation.x = -Math.PI * 0.5;

			/* Lights */
			const PHYSICS_WORLD_AMBIENT_LIGHT = new THREE.AmbientLight(0xffffff, 0.7);
			const PHYSICS_WORLD_DIRECTIONAL_LIGHT = new THREE.DirectionalLight(
				0xffffff,
				0.2
			);
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.castShadow = true;
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.shadow.mapSize.set(1024, 1024);
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.shadow.camera.far = 15;
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.shadow.camera.left = -7;
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.shadow.camera.top = 7;
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.shadow.camera.right = 7;
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.shadow.camera.bottom = -7;
			PHYSICS_WORLD_DIRECTIONAL_LIGHT.position.set(5, 5, 5);

			groupContainer?.add(
				// PHYSICS_WORLD_SPHERE,
				PHYSICS_WORLD_FLOOR,
				PHYSICS_WORLD_AMBIENT_LIGHT,
				PHYSICS_WORLD_DIRECTIONAL_LIGHT
			);

			/* Utils */
			const PHYSIC_WORLD_CREATED_SPHERES: {
				mesh: THREE.Mesh;
				body: Cannon.Body;
			}[] = [];
			const PHYSIC_WORLD_CREATED_BOXES: {
				mesh: THREE.Mesh;
				body: Cannon.Body;
			}[] = [];
			const physicWorldPlayTocSound = (collision: any) => {
				if (
					physicWorldTocSound &&
					collision.contact.getImpactVelocityAlongNormal() > 1.5
				) {
					physicWorldTocSound.volume = Math.random();
					physicWorldTocSound.currentTime = 0;
					physicWorldTocSound.play();
				}
			};
			const physicWorldCreateSphere = (
				radius: number,
				position: { x: number; y: number; z: number }
			) => {
				/* Mesh */
				const _SPHERE_MESH = new THREE.Mesh(
					PHYSIC_WORLD_SPHERE_GEOMETRY,
					PHYSIC_WORLD_DEFAULT_MATERIAL
				);
				_SPHERE_MESH.scale.set(radius, radius, radius);
				_SPHERE_MESH.castShadow = true;
				_SPHERE_MESH.position.x = position.x;
				_SPHERE_MESH.position.y = position.y;
				_SPHERE_MESH.position.z = position.z;

				/* Physic body */
				const _PHYSIC_SPHERE_BODY = new Cannon.Body({
					mass: 1,
					shape: new Cannon.Sphere(radius),
					position: new Vec3(position.x, position.y, position.z),
				});

				_PHYSIC_SPHERE_BODY.addEventListener(
					"collide",
					physicWorldPlayTocSound
				);
				groupContainer?.add(_SPHERE_MESH);
				physicWorld?.addBody(_PHYSIC_SPHERE_BODY);

				PHYSIC_WORLD_CREATED_SPHERES.push({
					mesh: _SPHERE_MESH,
					body: _PHYSIC_SPHERE_BODY,
				});
			};
			const physicWorldCreateBox = (
				radius: number,
				position: { x: number; y: number; z: number }
			) => {
				/* Mesh */
				const _BOX_MESH = new THREE.Mesh(
					PHYSIC_WORLD_BOX_GEOMETRY,
					PHYSIC_WORLD_DEFAULT_MATERIAL
				);
				_BOX_MESH.scale.set(radius, radius, radius);
				_BOX_MESH.castShadow = true;
				_BOX_MESH.position.x = position.x;
				_BOX_MESH.position.y = position.y;
				_BOX_MESH.position.z = position.z;

				/* Physic body */
				const _PHYSIC_SPHERE_BODY = new Cannon.Body({
					mass: 1,
					shape: new Cannon.Box(
						new Cannon.Vec3(radius / 2, radius / 2, radius / 2)
					),
					position: new Vec3(position.x, position.y, position.z),
				});

				_PHYSIC_SPHERE_BODY.addEventListener(
					"collide",
					physicWorldPlayTocSound
				);
				groupContainer?.add(_BOX_MESH);
				physicWorld?.addBody(_PHYSIC_SPHERE_BODY);

				PHYSIC_WORLD_CREATED_BOXES.push({
					mesh: _BOX_MESH,
					body: _PHYSIC_SPHERE_BODY,
				});
			};

			const PHYSIC_WORLD_GUI_OPTIONS = {
				createSphere: () =>
					physicWorldCreateSphere(Math.random() * 0.5, {
						x: (Math.random() - 0.5) * 3,
						y: 2.5,
						z: (Math.random() - 0.5) * 3,
					}),

				createBox: () =>
					physicWorldCreateBox(Math.random() * 0.5, {
						x: (Math.random() - 0.5) * 3,
						y: 2.5,
						z: (Math.random() - 0.5) * 3,
					}),
				reset: () => {
					PHYSIC_WORLD_CREATED_SPHERES.forEach((item) => {
						item.body.removeEventListener("collide", physicWorldPlayTocSound);
						physicWorld?.remove(item.body);

						groupContainer?.remove(item.mesh);
					});

					PHYSIC_WORLD_CREATED_BOXES.forEach((item) => {
						item.body.removeEventListener("collide", physicWorldPlayTocSound);
						physicWorld?.remove(item.body);

						groupContainer?.remove(item.mesh);
					});

					PHYSIC_WORLD_CREATED_SPHERES.splice(
						0,
						PHYSIC_WORLD_CREATED_SPHERES.length
					);
					PHYSIC_WORLD_CREATED_BOXES.splice(
						0,
						PHYSIC_WORLD_CREATED_BOXES.length
					);
				},
			};

			_GUI = appGui.addFolder(FOLDER_NAME);
			_GUI
				.add(PHYSIC_WORLD_GUI_OPTIONS, "createSphere")
				.name("Create random sphere");
			_GUI.add(PHYSIC_WORLD_GUI_OPTIONS, "createBox").name("Create random box");
			_GUI.add(PHYSIC_WORLD_GUI_OPTIONS, "reset").name("Reset created objects");

			app.scene.add(groupContainer);
			_GUI
				.add(
					{
						function: () => {
							PHYSIC_WORLD_GUI_OPTIONS.reset();
							destroy();
						},
					},
					"function"
				)
				.name("Destroy");

			onConstruct &&
				onConstruct({
					worldInstance: physicWorld,
					spheres: PHYSIC_WORLD_CREATED_SPHERES,
					boxes: PHYSIC_WORLD_CREATED_BOXES,
				});
		}
	};

	_GUI.add({ function: construct }, "function").name("Enable");

	return {
		destroy,
		construct,
	};
};
