module.exports = {
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