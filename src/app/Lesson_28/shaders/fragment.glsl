#define PI 3.1415926535897932384626433832795

varying vec2 vUv;

float random(vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) *
		43758.5453123);
}

vec2 rotateUv(vec2 uv, float rotation, vec2 mid) {
	return vec2(cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x, cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y);
}

//
//	Classic Perlin 2D Noise
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec2 fade(vec2 t) {
	return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

vec4 permute(vec4 x) {
	return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float cnoise(vec2 P) {
	vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
	vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
	Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
	vec4 ix = Pi.xzxz;
	vec4 iy = Pi.yyww;
	vec4 fx = Pf.xzxz;
	vec4 fy = Pf.yyww;
	vec4 i = permute(permute(ix) + iy);
	vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
	vec4 gy = abs(gx) - 0.5;
	vec4 tx = floor(gx + 0.5);
	gx = gx - tx;
	vec2 g00 = vec2(gx.x, gy.x);
	vec2 g10 = vec2(gx.y, gy.y);
	vec2 g01 = vec2(gx.z, gy.z);
	vec2 g11 = vec2(gx.w, gy.w);
	vec4 norm = 1.79284291400159 - 0.85373472095314 *
		vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
	g00 *= norm.x;
	g01 *= norm.y;
	g10 *= norm.z;
	g11 *= norm.w;
	float n00 = dot(g00, vec2(fx.x, fy.x));
	float n10 = dot(g10, vec2(fx.y, fy.y));
	float n01 = dot(g01, vec2(fx.z, fy.z));
	float n11 = dot(g11, vec2(fx.w, fy.w));
	vec2 fade_xy = fade(Pf.xy);
	vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
	float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
	return 2.3 * n_xy;
}

void main() {
	vec3 strength = vec3(0.0);

	// // Pattern 1
	// strength = vec3(vUv, 0.5);

	// // Pattern 2
	// strength = vec3(vUv, 0.0);

	// // Pattern 3
	// strength = vec3(vUv.x);

	// // Pattern 4
	// strength = vec3(vUv.y);

	// // Pattern 4.1
	// strength = vec3(sin(pow(vUv.y, -2.0) * -3.14159));

	// // Pattern 5
	// strength = vec3(1.0 - vUv.y);

	// // Pattern 6
	// strength = vec3(vUv.y * 10.0);

	// // Pattern 7
	// strength = vec3(mod(vUv.y * 10.0, 1.0));

	// // Pattern 8
	// float modY = mod(vUv.y * 10.0, 1.0);
	// strength = vec3(step(0.5, modY));

	// // Pattern 9
	// float modY = mod(vUv.y * 10.0, 1.0);
	// strength = vec3(step(0.8, modY));

	// // Pattern 10
	// float modX = mod(vUv.x * 10.0, 1.0);
	// strength = vec3(step(0.8, modX));

	// // Pattern 11
	float modX = mod(vUv.x * 10.0, 1.0);
	float modY = mod(vUv.y * 10.0, 1.0);
	float stepXY = step(0.8, modX) + step(0.8, modY);
	strength = vec3(stepXY);

	// // Pattern 12
	// float modX = mod(vUv.x * 10.0, 1.0);
	// float modY = mod(vUv.y * 10.0, 1.0);
	// float stepXY = step(0.8, modX) * step(0.8, modY);
	// strength = vec3(stepXY);

	// // Pattern 12.1
	// float modX = mod(vUv.x * 10.0, 1.0);
	// float modY = mod(vUv.y * 10.0, 1.0);
	// float stepXY = step(0.8, modX * 5.0) * step(0.8, modY * 5.0);
	// strength = vec3(stepXY);

	// // Pattern 13
	// float modX = mod(vUv.x * 10.0, 1.0);
	// float modY = mod(vUv.y * 10.0, 1.0);
	// float stepXY = step(0.4, modX) * step(0.8, modY);
	// strength = vec3(stepXY);

	// // Pattern 14
	// float modX = mod(vUv.x * 10.0, 1.0);
	// float modY = mod(vUv.y * 10.0, 1.0);
	// float barX = step(0.4, modX);
	// barX *= step(0.8, modY);
	// float barY = step(0.4, modY);
	// barY *= step(0.8, modX);
	// strength = vec3(barX + barY);

	// // Pattern 15
	// float barX = step(0.4, mod(vUv.x * 10.0 - 0.2, 1.0));
	// barX *= step(0.8, mod(vUv.y * 10.0, 1.0));
	// float barY = step(0.4, mod(vUv.y * 10.0 - 0.2, 1.0));
	// barY *= step(0.8, mod(vUv.x * 10.0, 1.0));
	// strength = vec3( barX + barY);

	// // Pattern 16
	// strength = vec3(abs(0.5 - vUv.x));

	// // Pattern 17
	// strength = vec3(min(abs(0.5 - vUv.x), abs(0.5 - vUv.y)));

	// // Pattern 18
	// strength = vec3(max(abs(0.5 - vUv.x), abs(0.5 - vUv.y)));

	// // Pattern 19
	// strength = vec3(step(0.2, max(abs(0.5 - vUv.x), abs(0.5 - vUv.y))));

	// // Pattern 20
	// float square1 = step(0.2, max(abs(0.5 - vUv.x), abs(0.5 - vUv.y)));
	// float square2 = 1.0 - step(0.25, max(abs(0.5 - vUv.x), abs(0.5 - vUv.y)));
	// strength = vec3(square1 * square2);

	// // Pattern 21
	// float lineX = floor(vUv.x * 10.0) / 10.0;
	// strength = vec3(lineX);

	// // Pattern 22
	// float lineX = floor(vUv.x * 10.0) / 10.0;
	// float lineY = floor(vUv.y * 10.0) / 10.0;
	// strength = vec3(lineX * lineY);

	// // Pattern 22.1
	// float lineX = floor(vUv.x * 10.0) / 10.0;
	// float lineY = floor(vUv.y * 10.0) / 10.0;
	// strength = vec3(min(lineX, lineY));

	// // Pattern 22.2
	// float lineX = floor(vUv.x * 10.0) / 10.0;
	// float lineY = floor(vUv.y * 10.0) / 10.0;
	// strength = vec3(max(lineX, lineY));

	// // Pattern 23
	// strength = vec3(random(vUv));

	// // Pattern 24
	// strength = vec3(random(floor(vUv * 10.0) / 10.0));

	// // Pattern 25
	// vec2 gridUv = vec2(floor(vUv.x * 10.0) / 10.0, floor(vUv.y * 10.0 + vUv.x * 5.0) / 10.0);
	// strength = vec3(random(gridUv));

	// // Pattern 26
	// strength = vec3(length(vUv));

	// // Pattern 27
	// strength = vec3(distance(vUv, vec2(0.5)));

	// // Pattern 28
	// strength = vec3(1.0 - distance(vUv, vec2(0.5)));

	// // Pattern 28.1
	// strength = vec3(step(0.8, 1.0 - distance(vUv, vec2(0.5))));

	// // Pattern 29
	// strength = vec3(0.015 / distance(vUv, vec2(0.5)));

	// // Pattern 30
	// strength = vec3(0.015 / distance(vec2(vUv.x * 0.1 + 0.45, vUv.y * 0.5 + 0.25), vec2(0.5)));

	// // Pattern 31
	// float arcX = 0.015 / distance(vec2(vUv.x * 0.1 + 0.45, vUv.y * 0.5 + 0.25), vec2(0.5));
	// float arcY = 0.015 / distance(vec2(vUv.y * 0.1 + 0.45, vUv.x * 0.5 + 0.25), vec2(0.5));
	// strength = vec3(arcX * arcY);

	// // Pattern 32
	// vec2 rotatedUv = rotateUv(vUv, PI * 0.25, vec2(0.5));
	// float arcX = 0.015 / distance(vec2(rotatedUv.x * 0.1 + 0.45, rotatedUv.y * 0.5 + 0.25), vec2(0.5));
	// float arcY = 0.015 / distance(vec2(rotatedUv.y * 0.1 + 0.45, rotatedUv.x * 0.5 + 0.25), vec2(0.5));
	// strength = vec3(arcX * arcY);

	// // Pattern 33
	// strength = vec3(step(0.25, distance(vUv, vec2(0.5))));

	// Pattern 34
	// strength = vec3(abs(distance(vUv, vec2(0.5)) - 0.25));

	// // Pattern 35
	// strength = vec3(step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25)));

	// // Pattern 36
	// strength = 1.0 - vec3(step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25)));

	// // Pattern 36
	// strength = 1.0 - vec3(step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25)));

	// // Pattern 37
	// vec2 wavedUv = vec2(vUv.x, vUv.y + sin(vUv.x * PI * 10.0) * 0.1);
	// strength = 1.0 - vec3(step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25)));

	// // Pattern 38
	// float frequency = PI * 10.0;
	// vec2 wavedUv = vec2(vUv.x + sin(vUv.y * frequency) * 0.1, vUv.y + sin(vUv.x * frequency) * 0.1);
	// strength = 1.0 - vec3(step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25)));

	// // Pattern 39
	// float frequency = PI * 30.0;
	// vec2 wavedUv = vec2(vUv.x + sin(vUv.y * frequency) * 0.1, vUv.y + sin(vUv.x * frequency) * 0.1);
	// strength = 1.0 - vec3(step(0.01, abs(distance(wavedUv, vec2(0.5)) - 0.25)));

	// // Pattern 40
	// float angle = atan(vUv.x, vUv.y);
	// strength = vec3(angle);

	// // Pattern 41
	// float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
	// strength = vec3(angle);

	// // Pattern 42
	// float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
	// strength = vec3((angle + PI) * 0.15);

	// // Pattern 42
	// float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
	// angle /= PI * 2.0;
	// angle += 0.5;
	// angle = mod(angle * 20.0, 1.0);
	// strength = vec3(angle);

	// // Pattern 44
	// float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
	// angle /= PI * 2.0;
	// angle += 0.5;
	// strength = vec3(sin(angle * PI * 30.0));

	// // Pattern 45
	// float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
	// angle /= PI * 2.0;
	// angle += 0.5;
	// float sinusoid = sin(angle * PI * 30.0);
	// float radius = 0.25 + sinusoid * 0.02;
	// float circle = 1.0 - (step(0.01, abs(distance(vUv, vec2(0.5)) - radius)));
	// strength = vec3(circle);

	// // Pattern 46
	// strength = vec3(cnoise(vUv * 10.0));

	// // Pattern 47
	// strength = vec3(step(0.0, cnoise(vUv * 10.0)));

	// // Pattern 48
	// strength = vec3(1.0 - abs( cnoise(vUv * 10.0)));

	// // Pattern 49
	// strength = vec3(sin(cnoise(vUv * 10.0) * 20.0));

	// Pattern 50
	// strength = vec3(step(0.9, sin(cnoise(vUv * 10.0) * 20.0)));

	// Clamp strength to avoid artifacts
	strength = clamp(strength, 0.0, 1.0);

	// Black and white output
	// gl_FragColor = vec4(strength, 1.0);

	// Colored output
	vec3 leftColor = vec3(0.0);
	vec3 uvColor = vec3(vUv, 0.5);
	vec3 mixedColor = mix(leftColor, uvColor, strength.r);
	gl_FragColor = vec4(mixedColor, 1.0);

}
