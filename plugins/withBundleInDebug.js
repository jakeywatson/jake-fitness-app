const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Sets debuggableVariants = [] in the react {} block so debug APKs
 * include the JS bundle. Required for Firebase Test Lab.
 */
module.exports = function withBundleInDebug(config) {
  return withAppBuildGradle(config, config => {
    let gradle = config.modResults.contents;
    
    // Remove existing debuggableVariants line (commented or not)
    gradle = gradle.replace(/\n\s*\/\/.*debuggableVariants.*\n/, '\n');
    gradle = gradle.replace(/\n\s*debuggableVariants\s*=\s*\[.*\]\n/, '\n');
    
    // Insert after bundleCommand line
    gradle = gradle.replace(
      /([ \t]*bundleCommand\s*=\s*"export:embed")/,
      `$1\n    debuggableVariants = []`
    );
    
    config.modResults.contents = gradle;
    return config;
  });
};
