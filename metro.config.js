const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Asegurarse de que las propiedades existen
config.resolver = config.resolver || {};
config.resolver.alias = {
  'react-native-svg': 'react-native-svg/lib/commonjs/ReactNativeSVG.web.js',
  '@': __dirname
};

config.resolver.platforms = ['web', 'native', 'ios', 'android'];
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'ts', 'tsx'];

config.transformer = config.transformer || {};
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
