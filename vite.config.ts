import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@helpers": path.resolve(__dirname, "./src/helpers"),
			"@public": path.resolve(__dirname, "./public"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@styles": path.resolve(__dirname, "./src/styles"),
		},
	},
});
