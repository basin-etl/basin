module.exports = {
  chainWebpack: config => {
    // template loader
    config.module
      .rule('python_template')
      .test(/\.template$/)   
      .use('file-loader')
      .loader('raw-loader')
      // .loader('./template-loader.ts')
    config
      .plugin('html')
      .tap((args) => {
        args[0].title = 'SuperGlue Studio';
        return args;
      });      
  },
  devServer: { 
    watchOptions: {
    },
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    proxy: {
        '/ijupyter': {
            target: 'http://127.0.0.1:9007',
            pathRewrite: {'^/ijupyter' : ''}
        }
    }
  },
  lintOnSave: false,  
  // "transpileDependencies": [
  //   "vuetify"
  // ]
}