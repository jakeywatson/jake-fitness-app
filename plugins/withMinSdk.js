const { withGradleProperties } = require('@expo/config-plugins');

/**
 * Sets android.minSdkVersion=26 so react-native-health-connect builds correctly.
 * Also sets bundleInDebug=true so debug APKs include the JS bundle
 * (required for Firebase Test Lab — no Metro server available there).
 */
module.exports = function withMinSdk(config, { minSdkVersion = 26 } = {}) {
  return withGradleProperties(config, config => {
    // Remove existing entries
    config.modResults = config.modResults.filter(
      item => !(item.type === 'property' && 
        ['android.minSdkVersion', 'minSdk', 'bundleInDebug'].includes(item.key))
    );
    config.modResults.push(
      { type: 'property', key: 'android.minSdkVersion', value: String(minSdkVersion) },
      { type: 'property', key: 'bundleInDebug', value: 'true' }
    );
    return config;
  });
};
