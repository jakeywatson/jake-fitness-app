const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withMinSdk(config, { minSdkVersion = 26 } = {}) {
  return withGradleProperties(config, config => {
    config.modResults = config.modResults.filter(
      item => !(item.type === 'property' && item.key === 'minSdk')
    );
    config.modResults.push({
      type: 'property',
      key: 'minSdk',
      value: String(minSdkVersion),
    });
    return config;
  });
};
