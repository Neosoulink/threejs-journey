import * as THREE from "three";

// CLASSES
import ThreeApp from "..";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export type foxActionAnimationNames =
	| "idle"
	| "walking"
	| "running"
	| "current";

export default class Fox {
	private app = new ThreeApp();
	model?: THREE.Group;
	animation: {
		mixer?: THREE.AnimationMixer;
		actions: {
			[key in foxActionAnimationNames]?: THREE.AnimationAction;
		};
		play?: (name: foxActionAnimationNames) => unknown;
	} = {
		actions: {},
	};

	constructor() {
		this.setModel();
		this.setAnimation();
	}

	setModel() {
		const _FOX = this.app.resources.items["foxModel"] as GLTF | undefined;

		if (_FOX) {
			this.model = _FOX.scene;
			if (this.model) {
				this.model?.scale.set(0.02, 0.02, 0.02);
				this.app.scene?.add(this.model);

				this.model?.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						child.castShadow = true;
					}
				});
			}
		}
	}

	setAnimation() {
		const _RESOURCE = this.app.resources.items["foxModel"] as GLTF | undefined;
		if (this.model && _RESOURCE) {
			// Mixer
			this.animation.mixer = new THREE.AnimationMixer(this.model);

			// Actions
			this.animation.actions.idle = this.animation.mixer.clipAction(
				_RESOURCE.animations[0]
			);
			this.animation.actions.walking = this.animation.mixer.clipAction(
				_RESOURCE.animations[1]
			);
			this.animation.actions.running = this.animation.mixer.clipAction(
				_RESOURCE.animations[2]
			);

			this.animation.actions.current = this.animation.actions.idle;
			this.animation.actions.current.play();

			// Play the action
			this.animation.play = (name) => {
				if (this.animation.actions && this.animation.actions.current) {
					const newAction = this.animation.actions[name];
					const oldAction = this.animation.actions.current;

					newAction?.reset();
					newAction?.play();
					newAction?.crossFadeFrom(oldAction, 1, false);

					this.animation.actions.current = newAction;
				}
			};

			// Debug
			// if (this.debug.active) {
			// 	const debugObject = {
			// 		playIdle: () => {
			// 			this.animation.play("idle");
			// 		},
			// 		playWalking: () => {
			// 			this.animation.play("walking");
			// 		},
			// 		playRunning: () => {
			// 			this.animation.play("running");
			// 		},
			// 	};
			// 	this.debugFolder.add(debugObject, "playIdle");
			// 	this.debugFolder.add(debugObject, "playWalking");
			// 	this.debugFolder.add(debugObject, "playRunning");
			// }
		}
	}

	update() {
		this.animation.mixer?.update(this.app.time.delta * 0.001);
	}
}
