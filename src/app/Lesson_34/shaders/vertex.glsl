attribute float aRandomSize;
attribute float aRandomTimeMultiplier;

uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

varying vec2 vUv;
varying vec3 vPosition;
varying float vSmallAlpha;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax) {
	return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main() {
	float progress = uProgress * aRandomTimeMultiplier;
	vec3 newPosition = position;

	// Exploding
	float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
	explodingProgress = clamp(explodingProgress, 0.0, 1.0);
	explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
	newPosition *= explodingProgress;

	// Falling
	float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
	fallingProgress = clamp(fallingProgress, 0.0, 1.0);
	fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
	newPosition.y -= fallingProgress * 0.2;

	// Scalling
	float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
	float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
	float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
	sizeProgress = clamp(sizeProgress, 0.0, 1.0);

	// Twinkling
	float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
	twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
	float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
	sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;

	// Model position
	vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);

	// View position
	vec4 viewPosition = viewMatrix * modelPosition;

	// Projected position
	vec4 projectedPosition = projectionMatrix * viewPosition;

	// Final position
	gl_Position = projectedPosition;

	// Final size
	gl_PointSize = uSize * uResolution.y;
	gl_PointSize *= aRandomSize;
	gl_PointSize *= sizeProgress;
	gl_PointSize *= sizeTwinkling;
	gl_PointSize *= 1.0 / -viewPosition.z;

	// Varyings
	vUv = uv;
	vPosition = modelPosition.xyz;
	vSmallAlpha = gl_PointSize < 1.0 ? 0.0 : 1.0;

}
