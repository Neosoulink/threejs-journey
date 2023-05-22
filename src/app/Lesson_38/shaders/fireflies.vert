uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute float aScale;

uniform float uPixelRation;
uniform float uSize;

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;

	gl_Position = projectionPosition;
	gl_PointSize = uSize * aScale * uPixelRation;
	gl_PointSize *= (1.0 / -viewPosition.z);
}
