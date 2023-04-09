// CLASSES
import ThreeApp from "../";
import Environment from "./Environment";

export default class Camera {
	app = new ThreeApp({});
	environment: Environment;

	constructor() {
		// Setup
		this.environment = new Environment();
	}

	resize() {}

	update() {}
}
