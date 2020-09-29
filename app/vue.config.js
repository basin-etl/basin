const MonacoEditorPlugin = require('monaco-editor-webpack-plugin')

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
        args[0].title = 'Basin Studio';
        return args;
      });
    config.plugin('monaco-editor').use(MonacoEditorPlugin, [
      {
        // Languages are loaded on demand at runtime
        languages: ['javascript']
      }
    ])            
  },
  devServer: { 
    watchOptions: {
    },
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080,
    proxy: {
        '/ijupyter': {
            target: `http://${process.env.VUE_APP_JUPYTER_SERVER_HOST}:${process.env.VUE_APP_JUPYTER_SERVER_PORT}`,
            pathRewrite: {'^/ijupyter' : ''}
        }
    }
  },
  lintOnSave: false,  
  // "transpileDependencies": [
  //   "vuetify"
  // ]
}