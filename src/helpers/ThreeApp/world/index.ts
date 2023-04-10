// CLASSES
import ThreeApp from "../";
import Environment from "./Environment";
import Floor from "./Floor";

export default class Camera {
	app = new ThreeApp({});
	environment?: Environment;
	floor?: Floor;

	constructor() {
		// Setup
		this.app.resources.on("ready", () => {
			this.floor = new Floor();
			this.environment = new Environment();
		});
	}

	resize() {}

	update() {}
}
