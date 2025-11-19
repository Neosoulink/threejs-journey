attribute float aScale;
attribute vec3 aRandomness;

uniform float uPointSize;
uniform float uTime;

varying vec3 vColor;

void main() {
	vec4 modelPosition = modelMatrix * vec4(position, 1.0);
	float modelAngle = atan(modelPosition.z, modelPosition.x);
	float distanceFromCenter = length(modelPosition.xz);
	float angleOffset = (1.0 / distanceFromCenter) * uTime * 0.2;
	modelAngle += angleOffset;

	modelPosition.x = cos(modelAngle) * distanceFromCenter;
	modelPosition.z = sin(modelAngle) * distanceFromCenter;

	modelPosition.xyz += aRandomness;

	vec4 viewPosition = viewMatrix * modelPosition;
	vec4 projectedPosition = projectionMatrix * viewPosition;

	vColor = color;

	gl_Position = projectedPosition;

	gl_PointSize = uPointSize * aScale;
	gl_PointSize *= (1.0 / -viewPosition.z);
}
