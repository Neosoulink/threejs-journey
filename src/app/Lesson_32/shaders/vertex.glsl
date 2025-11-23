uniform float uTime;
uniform sampler2D uPerlinTexture;

varying vec2 vUv;

vec2 rotate2D(vec2 target, float angle) {
	float c = cos(angle);
	float s = sin(angle);
	mat2 m = mat2(c, -s, s, c);

	return m * target;
}

void main() {
	vec3 newPosition = position;

	// Twist
	vec2 twistPerlinUv = vec2(0.5, uv.y * 0.2 - uTime * 0.001);
	float twistPerlin = texture2D(uPerlinTexture, twistPerlinUv).r;
	float angle = twistPerlin * 10.0;
	newPosition.xz = rotate2D(newPosition.xz, angle);

	// Wind
	float windOffsetX = texture2D(uPerlinTexture, vec2(0.25, uTime * 0.001)).r - 0.5;
	float windOffsetZ = texture2D(uPerlinTexture, vec2(0.75, uTime * 0.001)).r - 0.5;
	vec2 windOffset = vec2(windOffsetX, windOffsetZ);
	windOffset *= pow(uv.y, 2.0) * 10.0;
	newPosition.xz += windOffset;

	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	vUv = uv;
	gl_Position = projectedPosition;

}
