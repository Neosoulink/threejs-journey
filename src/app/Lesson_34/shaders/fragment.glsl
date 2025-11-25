uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;
varying vec3 vNormal;
varying float vSmallAlpha;

void main() {

	// Texture
	vec4 textureColor = texture2D(uTexture, gl_PointCoord);
	float textureAlpha = textureColor.r;

	// Final color
	gl_FragColor = vec4(uColor, textureAlpha * vSmallAlpha);

	#include <tonemapping_fragment>
	// #include <colorspace_fragment>
}
