const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración mejorada para React Native Web
config.resolver.alias = {
  'react-native-svg': 'react-native-svg/lib/commonjs/ReactNativeSVG.web.js',
  '@': __dirname
};

// Configuración adicional para web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add TypeScript support to source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Configuración para mejor compatibilidad web
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Configuración específica para resolver problemas con expo-modules-core
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configuración para manejar archivos TypeScript en node_modules
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = config;