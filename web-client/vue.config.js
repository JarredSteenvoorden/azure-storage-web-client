module.exports = {
  transpileDependencies: [
    'vuetify'
  ],

  // Below required to flatten dist directory structure for hosting in the $root Azure Storage container
  chainWebpack: (config) => {
    config.module
        .rule('images')
        .use('url-loader')
        .tap(options => Object.assign({}, options, { name: '[name].[ext]' }));
  },
  css: {
    extract: {
      filename: '[name].[hash].css',
      chunkFilename: '[name].[hash].css',
    },
  },
  configureWebpack: {
    output: {
      filename: '[name].[hash].js',
      chunkFilename: '[name].[hash].js',
    }
  },

  pages: {
    app: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      excludeChunks: ['oidc-callback']
    },
    oidccallback: {
      entry: 'src/oidc-callback.js',
      template: 'public/oidc-callback.html',
      filename: 'oidc-callback.html',
      excludeChunks: ['app']
    }
  }
}
