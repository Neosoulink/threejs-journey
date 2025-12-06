uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularTexture;
uniform vec3 uSunDirection;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
	vec3 viewDirection = normalize(vPosition - cameraPosition);
	vec3 normal = normalize(vNormal);
	vec3 color = vec3(0.0);
	// Sun
	float sunOrientation = dot(uSunDirection, normal);
	color = vec3(sunOrientation);

	// Day / Night Color
	float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
	vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
	vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
	color = mix(nightColor, dayColor, dayMix);

	// Specular Clouds
	vec2 specularCloudColor = texture2D(uSpecularTexture, vUv).rg;

	// Clouds
	float cloudsMix = smoothstep(0.5, 1.0, specularCloudColor.g);
	// cloudsMix *= dayMix;
	color = mix(color, vec3(clamp(1.0 * dayMix, 0.04, 1.0)), cloudsMix);

	// Fresnel
	float fresnel = dot(viewDirection, normal) + 1.0;
	fresnel = pow(fresnel, 2.0);

	// Atmosphere
	float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
	vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
	color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

	// Light Specular
	vec3 reflection = reflect(-uSunDirection, normal);
	float specular = -dot(reflection, viewDirection);
	specular = max(specular, 0.0);
	specular = pow(specular, 32.0);
	specular *= specularCloudColor.r;

	vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
	color += specular * specularColor;

    // Final color
	gl_FragColor = vec4(color, 1.0);

	#include <tonemapping_fragment>
  #include <colorspace_fragment>
}
