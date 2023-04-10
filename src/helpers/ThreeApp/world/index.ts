// CLASSES
import ThreeApp from "../";
import Environment from "./Environment";

export default class Camera {
	app = new ThreeApp({});
	environment?: Environment;

	constructor() {
		// Setup

		this.app.resources.on("ready", () => {
			this.environment = new Environment();
		});
	}

	resize() {}

	update() {}
}
