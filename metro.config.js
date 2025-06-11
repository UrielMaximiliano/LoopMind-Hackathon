const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración mejorada para React Native Web
config.resolver.alias = {
  'react-native-svg': 'react-native-svg/lib/commonjs/ReactNativeSVG.web.js',
  '@': __dirname,
};

// Configuración adicional para web
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Configuración para mejor compatibilidad web
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

module.exports = config;