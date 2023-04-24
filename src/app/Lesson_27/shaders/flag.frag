precision mediump float;

uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;
varying float vRandom;

void main() {
	vec4 textureColor = texture2D(uTexture, vUv);
	textureColor.rgb *= vElevation * 2.0 + 0.5;

	// gl_FragColor = vec4(0.3, vRandom, 0.4, 1.0);
	gl_FragColor = textureColor;
}
