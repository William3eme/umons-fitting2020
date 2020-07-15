const express = require('express');

module.exports = function(app){
    app.use("/",express.static('public/'));
    app.use("/src_public/",express.static('src_public/'));
    app.use("/dist",express.static('models/'));
}
