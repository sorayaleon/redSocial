"use strict";
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'claveSecreta';//Clave para codificar el token

exports.createToken = function(usuario){
    const payload = {
        sub: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        alias: usuario.alias,
        email: usuario.email,
        rol: usuario.rol,
        imagen: usuario.imagen,
        iat: moment().unix(),//momento en el que se ha creado el token
        exp: moment().add(30, 'days').unix
    }

    return jwt.encode(payload, secret);
}