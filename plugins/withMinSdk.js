const { withGradleProperties, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Write libs.versions.toml so Expo's autolinking plugin picks up minSdk
function withVersionCatalog(config, { minSdkVersion = 26 } = {}) {
  return withDangerousMod(config, [
    'android',
    async config => {
      const gradleDir = path.join(config.modRequest.projectRoot, 'android', 'gradle');
      const tomlPath = path.join(gradleDir, 'libs.versions.toml');
      fs.mkdirSync(gradleDir, { recursive: true });
      fs.writeFileSync(tomlPath, `[versions]\nminSdk = "${minSdkVersion}"\ncompileSdk = "35"\ntargetSdk = "35"\n`);
      return config;
    },
  ]);
}

// Also set in gradle.properties as a belt-and-braces fallback
function withGradlePropertiesMinSdk(config, { minSdkVersion = 26 } = {}) {
  return withGradleProperties(config, config => {
    config.modResults = config.modResults.filter(
      item => !(item.type === 'property' && item.key === 'minSdk')
    );
    config.modResults.push({ type: 'property', key: 'minSdk', value: String(minSdkVersion) });
    return config;
  });
}

module.exports = function withMinSdk(config, options = {}) {
  config = withVersionCatalog(config, options);
  config = withGradlePropertiesMinSdk(config, options);
  return config;
};
