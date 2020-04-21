'use strict';

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//Conexión a la BD
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/petbook', { useMongoClient: true }) 
.then(() => {
    console.log("Conexión creada con éxito.");

    //Crear servidor
    app.listen(port, () => {
        console.log("El servidor está corriendo...");
    });
})
.catch(err => console.log(err));