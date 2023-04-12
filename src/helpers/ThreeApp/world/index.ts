// CLASSES
import ThreeApp from "../";
import Environment from "./Environment";
import Floor from "./Floor";
import Fox from "./Fox";

export default class Camera {
	app = new ThreeApp({});
	environment?: Environment;
	floor?: Floor;
	Fox?: Fox;

	constructor() {
		// Setup
		this.app.resources.on("ready", () => {
			this.floor = new Floor();
			this.Fox = new Fox();
			this.environment = new Environment();
		});
	}

	resize() {}

	update() {
		this.Fox?.update();
	}
}
