uniform float uTime;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {

	// Normal
	vec3 normal = normalize(vNormal);
	if(!gl_FrontFacing)
		normal = -normal;

	// Stripes
	float stripes = mod((vPosition.g - uTime * 0.02) * 20.0, 1.0);
	stripes = pow(stripes, 3.0);

	// Fresnel
	vec3 viewDirection = normalize(vPosition - cameraPosition);
	float fresnel = dot(viewDirection, normal) + 1.0;
	fresnel = pow(fresnel, 2.0);

	// Falloff
	float falloff = smoothstep(0.8, 0.0, fresnel);

	// Hologram
	float hologram = stripes * fresnel;
	hologram += fresnel * 1.25;
	hologram *= falloff;

	gl_FragColor = vec4(uColor, hologram);

	#include <color_fragment>
	#include <encodings_fragment>
}
