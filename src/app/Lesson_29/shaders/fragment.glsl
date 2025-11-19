uniform vec3 uWavesDepthColor;
uniform vec3 uWavesSurfaceColor;
uniform float uWavesColorMultiplier;
uniform float uWavesColorOffset;

varying vec2 vUv;
varying float vElevation;

void main() {
	vec3 mixedColor = mix(uWavesDepthColor, uWavesSurfaceColor, vElevation * uWavesColorMultiplier + uWavesColorOffset);
	vec3 outputColor = mix(vec3(vUv, 0.5), mixedColor, 0.6);

	gl_FragColor = vec4(outputColor, 1.0);
}
