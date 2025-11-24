uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

float random2D(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) *
		43758.5453123);
}

void main() {

	// Model position
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);

	// Glitch
	float glitchTime = uTime - modelPosition.y;
	float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.75);
	glitchStrength /= 3.0;
	glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
	glitchStrength *= 0.25;
	modelPosition.x += ((random2D(modelPosition.xz + uTime * 0.1)) - 0.5) * glitchStrength;
	modelPosition.z += ((random2D(modelPosition.zx + uTime * 0.1)) - 0.5) * glitchStrength;

	// Model normal
	vec4 modelNormal = modelMatrix * vec4((normal), 0.0);

	// Final position
	vec4 projectedPosition = projectionMatrix * viewMatrix * modelPosition;

	// Varyings
	vUv = uv;
	vPosition = modelPosition.xyz;
	vNormal = modelNormal.xyz;

	gl_Position = projectedPosition;

}
