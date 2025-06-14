const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Asegurarse de que las propiedades existen
config.resolver = config.resolver || {};
config.transformer = config.transformer || {};

// Configuración mejorada para React Native Web
config.resolver.alias = {
  'react-native-svg': 'react-native-svg/lib/commonjs/ReactNativeSVG.web.js',
  '@': __dirname,
};

// Plataformas compatibles
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Extensiones de archivo con soporte TypeScript
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'ts', 'tsx'];

// Plugin de assets para web
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Resolver campos principales
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Soporte para TypeScript en node_modules
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = config;
