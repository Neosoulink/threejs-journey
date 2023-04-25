uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;

varying float vRandom;
varying float vElevation;
varying vec2 vUv;

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	float elevetion = sin(modelPosition.x * aRandom * uFrequency.x + uTime) * 0.1;
	elevetion += sin(modelPosition.y * aRandom * uFrequency.y + uTime) * 0.1;
	modelPosition.z += elevetion;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;

	vElevation = elevetion;
	vRandom = aRandom;
	vUv = uv;
	gl_Position = projectionPosition;

	// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

}
