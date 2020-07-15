const express = require('express');
const multer = require('multer');
const multipart = multer();

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const app = express();
const port = 3000;

// require("./models/line")


const devServerEnabled = true;

if (devServerEnabled) {
    //reload=true:Enable auto reloading when changing JS files or content
    //timeout=1000:Time from disconnecting from server to reconnecting
    // config.entry.app.unshift('webpack-hot-middleware/client?reload=false&timeout=1000');

    //Add HMR plugin
    config.plugins.push(new webpack.HotModuleReplacementPlugin());
    // console.log(config)
    const compiler = webpack(config);

    //Enable "webpack-dev-middleware"
    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath
    }));

    //Enable "webpack-hot-middleware"
    app.use(webpackHotMiddleware(compiler));
}

app.listen(port, () => {
    console.log('Server started on port:' + port);
});

require("./src_server/router")(app)
require("./src_server/api")(app)
// require("./src_server/api")("coucou")
// require("./src_server/api-dev")(app)


