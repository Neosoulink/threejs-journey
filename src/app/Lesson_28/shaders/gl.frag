precision mediump float;

uniform sampler2D uTexture;

varying float vRandom;
varying float vElevation;
varying vec2 vUv;

void main() {
	vec4 textureColor = texture2D(uTexture, vUv);
	textureColor.rgb *= vElevation * 2.0 + 0.5;

	gl_FragColor = textureColor;
	gl_FragColor *= vec4(vec3(normalize(vRandom)) * 1.0, 1.0);
}
