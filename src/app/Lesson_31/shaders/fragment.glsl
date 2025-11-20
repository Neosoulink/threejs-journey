#define PI 3.1415926535897932384626433832795

varying vec3 vColor;

void main() {

	vec3 outputColor;
	float strength;
	float disc = distance(gl_PointCoord, vec2(0.5));

	// // Disc
	// strength = step(0.8, 1.0 - disc);

	// // Diffused Disc
	// strength = disc * 2.0;
	// strength = 1.0 - strength;

	// // Diffused Disc 2
	// strength = smoothstep(0.5, 1.05, 1.0 - disc) * 2.0;

	// Light Point
	strength = distance(gl_PointCoord, vec2(0.5));
	strength = 1.0 - strength;
	strength = pow(strength, 10.0);

	outputColor = mix(vec3(0.0), vColor, strength);
	// outputColor = vec3(gl_PointCoord, 0.5) * strength;

	gl_FragColor = vec4(outputColor, 1.0);

	#include <encodings_fragment>
}
