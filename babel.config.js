module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }]
    ],
    plugins: [
      // Reanimated plugin should be listed last
      'react-native-reanimated/plugin'
    ]
  };
};