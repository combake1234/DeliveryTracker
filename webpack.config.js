const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // 웹 최적화 설정
  config.optimization = {
    ...config.optimization,
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  };

  return config;
}; 