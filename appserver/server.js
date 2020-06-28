// include dependencies
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// proxy middleware options
const options = {
  target: 'http://localhost:8888', // target host
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  pathRewrite: {
    '^/ijupyter': '', // rewrite path
  },
};

// create the proxy (without context)
const proxy = createProxyMiddleware(options);

// mount `exampleProxy` in web server
const app = express();
app.use('/ijupyter', proxy);
app.use('/',express.static('dist'))
app.listen(3000);