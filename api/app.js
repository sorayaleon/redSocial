'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var app = express();

//Cargar rutas
var userRoutes = require('./routes/user');
var followRoutes = require('./routes/follow');
var publicacionRoutes = require('./routes/publicacion');

//Middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Cors


//Rutas
app.use('/api', userRoutes);
app.use('/api', followRoutes);
app.use('/api', publicacionRoutes);

//Exportar la configuración
module.exports = app;