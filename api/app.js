'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//Cargar rutas
var userRoutes = require('./routes/user');
var followRoutes = require('./routes/follow');
var publicacionRoutes = require('./routes/publicacion');
var mensajeRoutes = require('./routes/mensaje');

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
 
    next();
});


//Rutas
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicacionRoutes);
app.use('/api', mensajeRoutes);

//Exportar la configuración
module.exports = app;