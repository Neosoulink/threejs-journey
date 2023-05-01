import * as THREE from "three";
import GUI from "lil-gui";

// HELPERS
import ThreeApp from "../../helpers/ThreeApp";

// IMGS
import displacementTextureImg from "../../assets/img/textures/displacementMap.png";

// LOCAL TYPES
export interface Lesson32ConstructorProps {
	textureLoader?: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
}

export default class Lesson_33 {
	folderName = "Lesson 33 | Performance tips";
	app = new ThreeApp();
	appGui?: GUI;
	gui?: GUI;
	mainGroup?: THREE.Group;
	clock?: THREE.Clock;
	textureLoader: THREE.TextureLoader;
	onConstruct?: () => unknown;
	onDestruct?: () => unknown;
	resizeEvent?: () => unknown;

	constructor(props?: Lesson32ConstructorProps) {
		this.appGui = this.app.debug?.ui;
		this.gui = this.appGui?.addFolder(this.folderName);
		this.gui?.add({ fn: () => this.construct() }, "fn").name("Enable");
		this.gui?.close();
		this.textureLoader = props?.textureLoader ?? new THREE.TextureLoader();

		if (props?.onConstruct) this.onConstruct = props?.onConstruct;
		if (props?.onDestruct) this.onDestruct = props?.onDestruct;
	}

	destroy() {
		if (this.mainGroup) {
			this.mainGroup.traverse((child) => {
				if (child instanceof THREE.Mesh) {
					child.geometry.dispose();

					for (const key in child.material) {
						const value = child.material[key];

						if (value && typeof value.dispose === "function") {
							value.dispose();
						}
					}
				}
			});

			this.app.scene.remove(this.mainGroup);

			this.mainGroup?.clear();
			this.mainGroup = undefined;

			if (this.gui) {
				this.gui.destroy();
				this.gui = undefined;
			}

			this.gui = this.appGui?.addFolder(this.folderName);
			this.gui
				?.add({ function: () => this.construct() }, "function")
				.name("Enable");

			if (this.app.updateCallbacks[this.folderName]) {
				delete this.app.updateCallbacks[this.folderName];
			}

			this.onDestruct && this.onDestruct();
		}
	}

	async construct() {
		if (this.gui) {
			this.gui.destroy();
			this.gui = undefined;
		}

		if (this.mainGroup) {
			this.destroy();
		}

		if (!this.mainGroup) {
			this.mainGroup = new THREE.Group();

			const displacementTexture = this.textureLoader.load(
				displacementTextureImg
			);

			this.app.renderer.shadowMap.enabled = true;
			this.app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			this.app.renderer.setSize(this.app.sizes.width, this.app.sizes.height);
			this.app.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

			/**
			 * Test meshes
			 */
			const cube = new THREE.Mesh(
				new THREE.BoxGeometry(2, 2, 2),
				new THREE.MeshStandardMaterial()
			);
			cube.castShadow = true;
			cube.receiveShadow = true;
			cube.position.set(-5, 0, 0);
			// this.mainGroup.add(cube)

			const torusKnot = new THREE.Mesh(
				new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
				new THREE.MeshStandardMaterial()
			);
			torusKnot.castShadow = true;
			torusKnot.receiveShadow = true;
			// this.mainGroup.add(torusKnot)

			const sphere = new THREE.Mesh(
				new THREE.SphereGeometry(1, 32, 32),
				new THREE.MeshStandardMaterial()
			);
			sphere.position.set(5, 0, 0);
			sphere.castShadow = true;
			sphere.receiveShadow = true;
			// this.mainGroup.add(sphere)

			const floor = new THREE.Mesh(
				new THREE.PlaneGeometry(10, 10),
				new THREE.MeshStandardMaterial()
			);
			floor.position.set(0, -2, 0);
			floor.rotation.x = -Math.PI * 0.5;
			floor.castShadow = true;
			floor.receiveShadow = true;
			// this.mainGroup.add(floor)

			// /**
			//  * Lights
			//  */
			// const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
			// directionalLight.castShadow = true
			// directionalLight.shadow.mapSize.set(1024, 1024)
			// directionalLight.shadow.camera.far = 15
			// directionalLight.shadow.normalBias = 0.05
			// directionalLight.position.set(0.25, 3, 2.25)
			// this.mainGroup.add(directionalLight)

			/**
			 * Tips
			 */

			// // Tip 4
			// console.log(renderer.info)

			// // Tip 6
			// scene.remove(cube)
			// cube.geometry.dispose()
			// cube.material.dispose()

			// // Tip 10
			// directionalLight.shadow.camera.top = 3
			// directionalLight.shadow.camera.right = 6
			// directionalLight.shadow.camera.left = - 6
			// directionalLight.shadow.camera.bottom = - 3
			// directionalLight.shadow.camera.far = 10
			// directionalLight.shadow.mapSize.set(1024, 1024)

			// const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
			// this.mainGroup.add(cameraHelper)

			// // Tip 11
			// cube.castShadow = true
			// cube.receiveShadow = false

			// torusKnot.castShadow = true
			// torusKnot.receiveShadow = false

			// sphere.castShadow = true
			// sphere.receiveShadow = false

			// floor.castShadow = false
			// floor.receiveShadow = true

			// // Tip 12
			// renderer.shadowMap.autoUpdate = false
			// renderer.shadowMap.needsUpdate = true

			// // Tip 18
			// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

			// for(let i = 0; i < 50; i++)
			// {
			//     const material = new THREE.MeshNormalMaterial()

			//     const mesh = new THREE.Mesh(geometry, material)
			//     mesh.position.x = (Math.random() - 0.5) * 10
			//     mesh.position.y = (Math.random() - 0.5) * 10
			//     mesh.position.z = (Math.random() - 0.5) * 10
			//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
			//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

			//     this.mainGroup.add(mesh)
			// }

			// // Tip 19
			// const geometries = []

			// for(let i = 0; i < 50; i++)
			// {
			//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

			//     geometry.rotateX((Math.random() - 0.5) * Math.PI * 2)
			//     geometry.rotateY((Math.random() - 0.5) * Math.PI * 2)

			//     geometry.translate(
			//         (Math.random() - 0.5) * 10,
			//         (Math.random() - 0.5) * 10,
			//         (Math.random() - 0.5) * 10
			//     )

			//     geometries.push(geometry)
			// }

			// const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
			// const material = new THREE.MeshNormalMaterial()
			// const mesh = new THREE.Mesh(mergedGeometry, material)
			// this.mainGroup.add(mesh)

			// // Tip 20
			// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
			// const material = new THREE.MeshNormalMaterial()

			// for(let i = 0; i < 50; i++)
			// {
			//     const mesh = new THREE.Mesh(geometry, material)
			//     mesh.position.x = (Math.random() - 0.5) * 10
			//     mesh.position.y = (Math.random() - 0.5) * 10
			//     mesh.position.z = (Math.random() - 0.5) * 10
			//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
			//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

			//     this.mainGroup.add(mesh)
			// }

			// // Tip 22
			// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
			// const material = new THREE.MeshNormalMaterial()

			// const mesh = new THREE.InstancedMesh(geometry, material, 50)
			// mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
			// this.mainGroup.add(mesh)

			// for(let i = 0; i < 50; i++)
			// {
			//     const position = new THREE.Vector3(
			//         (Math.random() - 0.5) * 10,
			//         (Math.random() - 0.5) * 10,
			//         (Math.random() - 0.5) * 10
			//     )

			//     const quaternion = new THREE.Quaternion()
			//     quaternion.setFromEuler(new THREE.Euler(
			//         (Math.random() - 0.5) * Math.PI * 2,
			//         (Math.random() - 0.5) * Math.PI * 2,
			//         0
			//     ))

			//     const matrix = new THREE.Matrix4()
			//     matrix.makeRotationFromQuaternion(quaternion)
			//     matrix.setPosition(position)
			//     mesh.setMatrixAt(i, matrix)
			// }

			// // Tip 29
			// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

			// Tip 31, 32, 34 and 35
			const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256);

			const shaderMaterial = new THREE.ShaderMaterial({
				precision: "lowp",
				uniforms: {
					uDisplacementTexture: { value: displacementTexture },
				},
				defines: {
					DISPLACMENT_STRENGH: 1.5,
				},
				vertexShader: `
        uniform sampler2D uDisplacementTexture;

        varying vec3 vColor;

        void main()
        {
            // Position
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            float elevation = texture2D(uDisplacementTexture, uv).r;
            modelPosition.y += max(elevation, 0.5) * DISPLACMENT_STRENGH;
            gl_Position = projectionMatrix * viewMatrix * modelPosition;

            // Color
            float colorElevation = max(elevation, 0.25);
            vec3 color = mix(vec3(1.0, 0.1, 0.1), vec3(0.1, 0.0, 0.5), colorElevation);

            // Varying
            vColor = color;
        }
    `,
				fragmentShader: `
        varying vec3 vColor;

        void main()
        {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `,
			});

			const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial);
			shaderMesh.rotation.x = -Math.PI * 0.5;
			this.mainGroup.add(shaderMesh);

			/**
			 * Animate
			 */

			const tick = () => {
				const elapsedTime = this.clock?.getElapsedTime() ?? 0;

				// Update test mesh
				torusKnot.rotation.y = elapsedTime * 0.1;
			};

			this.app.setUpdateCallback(this.folderName, () => {
				tick();
			});

			this.app.scene.add(this.mainGroup);
			this.gui = this.appGui?.addFolder(this.folderName);

			this.gui
				?.add({ function: () => this.destroy() }, "function")
				.name("Destroy");
		}

		this.onConstruct && this.onConstruct();
	}
}
