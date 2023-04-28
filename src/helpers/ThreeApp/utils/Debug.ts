import { GUI } from "lil-gui";

export default class Debug {
	active = window.location.hash === "#debug";
	ui?: GUI;

	constructor(active?: boolean) {
		if (this.active || active) {
			this.ui = new GUI();
		}
	}
}
