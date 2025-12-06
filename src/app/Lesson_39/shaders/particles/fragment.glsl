uniform sampler2D uPictureTexture;

varying vec3 vColor;

void main() {

	vec2 uv = gl_PointCoord;
	float distanceToCenter = length(uv - 0.5);
	float alpha = step(distanceToCenter, 0.5);

	if(distanceToCenter > 0.5)
		discard;

	gl_FragColor = vec4(vColor, alpha);

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}
