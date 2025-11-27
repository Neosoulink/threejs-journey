varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {

	// Model position
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	// Model normal
	vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

	// View position
	vec4 viewPosition = viewMatrix * modelPosition;

	// Projected position
	vec4 projectedPosition = projectionMatrix * viewPosition;

	// Final position
	gl_Position = projectedPosition;

	// Varyings
	vUv = uv;
	vNormal = modelNormal.xyz;
	vPosition = modelPosition.xyz;

}
