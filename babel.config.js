module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@features': './src/features',
            '@data-access': './src/data-access',
            '@libs': './src/libs',
            '@operations': './src/operations',
            '@design-system': './src/design-system',
            '@types': './src/types',
            '@entry-providers': './src/entry-providers',
            '@assets': './src/assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
