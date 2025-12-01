uniform vec3 uWavesDepthColor;
uniform vec3 uWavesSurfaceColor;
uniform float uWavesColorMultiplier;
uniform float uWavesColorOffset;

varying vec3 vNormal;
varying float vElevation;
varying vec3 vPosition;

#include <ambientLight>
#include <directionalLight>
#include <pointLight>

void main() {
	vec3 viewDirection = normalize(vPosition - cameraPosition);
	vec3 normal = normalize(vNormal);

	// Base color
	float mixStrength = (vElevation + uWavesColorOffset) * uWavesColorMultiplier;
	mixStrength = smoothstep(0.0, 1.0, mixStrength);
	vec3 color = mix(uWavesDepthColor, uWavesSurfaceColor, mixStrength);

	// Lights
	vec3 light = vec3(0.0);
	light += pointLight( //
	vec3(1.0),								    // Light color
	10.0,                               // Light intensity
	normal,														  // Normal
	vec3(0.0, 0.25, 0.0),    // Light position
	viewDirection,										  // View direction
	30.0,																// Specular power,
	vPosition, 												  // Position
	0.95 																// Decay
	);
	// light += directionalLight( //
	// vec3(1.0),								    // Light color
	// 1.0,                                // Light intensity
	// normal,														  // Normal
	// vec3(-1.0, 0.5, 0.0),  // Light position
	// viewDirection,										  // View direction
	// 32.0																// Specular power
	// );

	color *= light;

	gl_FragColor = vec4(color, 1.0);

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
