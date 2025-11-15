uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
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

	float elevation = sin(modelPosition.x * uFrequency.x + uTime) * 0.2;
	elevation += sin(modelPosition.y * uFrequency.y + uTime) * 0.05;
	modelPosition.z += elevation;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;
	projectionPosition.z += ((elevation * -2.0) * aRandom);

	vElevation = elevation;
	vRandom = aRandom;
	vUv = uv;

	gl_Position = projectionPosition;

	/* Default */
	// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

}
