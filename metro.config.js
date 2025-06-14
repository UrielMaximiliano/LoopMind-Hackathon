const { getDefaultConfig } = require('expo/metro-config');

// Obtener config base
const config = getDefaultConfig(__dirname);

// Asegurar estructuras existentes
config.resolver = config.resolver || {};
config.resolver.sourceExts = config.resolver.sourceExts || [];
config.resolver.alias = config.resolver.alias || {};
config.transformer = config.transformer || {};

// Agregar alias
config.resolver.alias['react-native-svg'] = 'react-native-svg/lib/commonjs/ReactNativeSVG.web.js';
config.resolver.alias['@'] = __dirname;

// Agregar plataformas
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Extensiones
config.resolver.sourceExts.push('ts', 'tsx');

// Configuración del transformer
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];
config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Resolver campos principales
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
