import EventEmitter from "events";

export interface sceneSizesType {
	width: number;
	height: number;
}

export interface SizesProps {
	sceneSizes: sceneSizesType;
	autoSceneResize?: boolean;
}

export default class Sizes extends EventEmitter {
	sceneSizes: SizesProps["sceneSizes"];
	autoSceneResize: SizesProps["autoSceneResize"];
	pixelRatio = Math.min(window.devicePixelRatio, 2);

	constructor(props: SizesProps) {
		super();

		this.sceneSizes = props.sceneSizes;
		this.autoSceneResize = props.autoSceneResize;

		if (
			props?.autoSceneResize === undefined ||
			props?.autoSceneResize === true
		) {
			window.addEventListener("resize", () => {
				this.sceneSizes.width = window.innerWidth;
				this.sceneSizes.height = window.innerHeight;

				this.emit("resize", this.sceneSizes);
			});
		}
	}
}
