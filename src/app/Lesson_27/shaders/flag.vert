uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform vec2 uFrequency;
uniform float uTime;

attribute vec3 position;
attribute float aRandom;

varying float vRandom;

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	modelPosition.z += sin(modelPosition.x * aRandom * uFrequency.x + uTime) * 0.1;
	modelPosition.z += sin(modelPosition.y * aRandom * uFrequency.y + uTime) * 0.1;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;

	vRandom = aRandom;
	gl_Position = projectionPosition;

	// gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

}
