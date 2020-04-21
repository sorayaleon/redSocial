"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = Schema({
    nombre: String,
    apellidos: String,
    alias: String,
    email: String,
    password: String,
    rol: String,
    imagen: String
});

module.exports = mongoose.model('User', userSchema);