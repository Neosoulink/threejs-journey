uniform float uTime;
uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vPosition;

varying vec2 vUv;

vec3 ambientLight(vec3 color, float intensity) {
	return color * intensity;
}

vec3 directionalLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower) {

	vec3 lightDirection = normalize(lightPosition);
	vec3 lightReflection = reflect(-lightDirection, normal);

	// Shading
	float shading = dot(normal, lightDirection);
	shading = max(0.0, shading);

	// Specular
	float specular = -dot(lightReflection, viewDirection);
	specular = max(0.0, specular);
	specular = pow(specular, specularPower);

	return lightColor * lightIntensity * (shading + specular);
}

vec3 pointLight(vec3 lightColor, float lightIntensity, vec3 normal, vec3 lightPosition, vec3 viewDirection, float specularPower, vec3 position, float lightDecay) {

	vec3 lightDelta = lightPosition - position;
	float lightDistance = length(lightDelta);
	vec3 LightDirection = normalize(lightDelta);
	vec3 lightReflection = reflect(-LightDirection, normal);

	// Shading
	float shading = dot(normal, LightDirection);
	shading = max(0.0, shading);

	// Specular
	float specular = -dot(lightReflection, viewDirection);
	specular = max(0.0, specular);
	specular = pow(specular, specularPower);

	// Decay
	float decay = 1.0 - lightDistance * lightDecay;
	decay = max(0.0, decay);

	return lightColor * lightIntensity * decay * (shading + specular);
}

void main() {
	vec3 viewDirection = normalize(vPosition - cameraPosition);
	vec3 color = uColor;
	vec3 normal = normalize(vNormal);

	// Light
	vec3 light = vec3(0.0);
	light += ambientLight(
	// Ambient Light Params
	vec3(1.0), // Color
	0.03 // Intensity
	);
	light += directionalLight(
	// Directional Light Params
	vec3(0.1, 0.1, 1.0), // Color
	1.0, // Intensity
	normal, // Normal
	vec3(0.0, 0.0, 3.0), // Position
	viewDirection, // Direction
	20.0// Specular power
	);
	light += pointLight(
	// Point Light Params
	vec3(1.0, 0.1, 0.1), // Color
	1.0, // Intensity
	normal, // Normal
	vec3(0.0, 2.5, 0.0),  // Position
	viewDirection,  // Direction
	20.0, // Specular power
	vPosition, // Position
	0.25 // Light decay
	);
	light += pointLight(
	// Point Light Params
	vec3(0.0, 1.0, 0.5), // Color
	1.0, // Intensity
	normal, // Normal
	vec3(2.0, 2.0, 2.0),  // Position
	viewDirection,  // Direction
	20.0, // Specular power
	vPosition, // Position
	0.2 // Light decay
	);
	color *= light;

	// Final color
	gl_FragColor = vec4(color, 1.0);

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
