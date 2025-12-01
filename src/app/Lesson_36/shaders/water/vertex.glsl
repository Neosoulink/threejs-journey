uniform float uTime;

uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;

uniform float uSmallWavesElevation;
uniform vec2 uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallWavesIterations;

varying vec3 vNormal;
varying float vElevation;
varying vec3 vPosition;

#include <perlinClassic3D>

float waveElevation(vec3 position) {
	float elevation = sin(position.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) *
		sin(position.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) *
		uBigWavesElevation;

	for(float i = 1.0; i <= uSmallWavesIterations; i++) {
		elevation -= abs(perlinClassic3D(vec3(position.xz * uSmallWavesFrequency.xy * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
	}

	return elevation;
}

void main() {
	// Base position
	float shift = 0.01;
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	vec3 modelPositionA = modelPosition.xyz + vec3(shift, 0.0, 0.0);
	vec3 modelPositionB = modelPosition.xyz + vec3(0.0, 0.0, -shift);

  // Elevation
	float elevation = waveElevation(modelPosition.xyz);
	modelPosition.y += elevation;
	modelPositionA.y += waveElevation(modelPositionA);
	modelPositionB.y += waveElevation(modelPositionB);

	// Compute normals
	vec3 toA = normalize(modelPositionA - modelPosition.xyz);
	vec3 toB = normalize(modelPositionB - modelPosition.xyz);
	vec3 computedNormal = cross(toA, toB);

	// Final position
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;
	gl_Position = projectedPosition;

	// Varyings
	vNormal = computedNormal;
	vElevation = elevation;
	vPosition = modelPosition.xyz;
}
