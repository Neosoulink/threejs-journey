attribute vec4 tangent;

uniform float uPositionFrequency;
uniform float uTime;
uniform float uTimeFrequency;
uniform float uStrength;
uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

varying float vWobble;

#include simplexNoise4d

float getWobble(vec3 position) {

	vec3 wrappedPosition = position;
	wrappedPosition += simplexNoise4d(vec4( //
	position * uWarpPositionFrequency, // XYZ
	uTime * uWarpTimeFrequency // W
	)) * uWarpStrength;

	return simplexNoise4d(vec4( //
	wrappedPosition * uPositionFrequency, // XYZ
	uTime * uTimeFrequency // W
	)) * uStrength;
}

void main() {
	vec3 biTangent = cross(normal, tangent.xyz);

	// Neighborhood positions
	float shift = 0.01;
	vec3 positionA = csm_Position + tangent.xyz * shift;
	vec3 positionB = csm_Position + biTangent * shift;

	// Wobble
	float wobble = getWobble(csm_Position);
	csm_Position += wobble * normal;
	positionA += getWobble(positionA) * normal;
	positionB += getWobble(positionB) * normal;

	// Compute Normal
	vec3 toA = normalize(positionA - csm_Position);
	vec3 toB = normalize(positionB - csm_Position);
	csm_Normal = cross(toA, toB);

	// Varyings
	vWobble = wobble / uStrength;
}
