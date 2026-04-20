const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Sets android.minSdkVersion in gradle.properties.
 * 
 * Expo's autolinking plugin reads react-native's gradle/libs.versions.toml
 * which defaults minSdk to 24. It then checks for a Gradle property named
 * "android.minSdkVersion" and uses that to override the catalog value.
 * 
 * react-native-health-connect requires minSdk >= 26 (Android 8.0).
 */
module.exports = function withMinSdk(config, { minSdkVersion = 26 } = {}) {
  return withGradleProperties(config, config => {
    // Remove any existing entries for either property name
    config.modResults = config.modResults.filter(
      item => !(item.type === 'property' && 
        (item.key === 'android.minSdkVersion' || item.key === 'minSdk'))
    );
    // Set the property that Expo's autolinking plugin actually reads
    config.modResults.push({
      type: 'property',
      key: 'android.minSdkVersion',
      value: String(minSdkVersion),
    });
    return config;
  });
};
