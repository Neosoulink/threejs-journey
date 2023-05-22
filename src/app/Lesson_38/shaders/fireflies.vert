uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform float uPixelRation;
uniform float uSize;

attribute vec3 position;

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectionPosition = projectionMatrix * viewPosition;

	gl_Position = projectionPosition;
	gl_PointSize = uSize * uPixelRation;
	gl_PointSize *= (1.0 / -viewPosition.z);
}
