"use strict";

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');
var User = require('../models/user');
var Follow = require('../models/follow');
var jwt = require('../services/jwt');


function inicio (req, res) {
    res.status(200).send({
        message: 'Hola mundo desde nodejs'
    });
}

function pruebas (req, res) {
    console.log(req.body);
    res.status(200).send({
        message: 'Acción de prueba en el servidor'
    });
}

function saveUsuario(req, res){
    var params = req.body;
    var usuario = new User();

    if(params.nombre && params.apellidos && params.alias && params.email && params.password){
        usuario.nombre = params.nombre;
        usuario.apellidos = params.apellidos;
        usuario.alias = params.alias;
        usuario.email = params.email;
        usuario.rol = 'ROLE_USER';
        usuario.imagen = null;

        //Evitar que se introduzca un usuario que existe en la BD
        User.find({ $or: [
                                    {email: usuario.email.toLowerCase()},
                                    {alias: usuario.alias.toLowerCase()}
                                    
                            ]}).exec((err, users) => {
                                if(err) return res.status(500).send({ message: 'Error en la petición de usuarios.'});
                                if(users && users.length >= 1){
                                    return res.status(200).send({ message: 'El usuario ya existe.'});
                                }else{
                                    
                            //Cifrado de contraseña y guarda datos
                            bcrypt.hash(params.password, null, null, (err, hash) => {
                            usuario.password = hash;
                            usuario.save((err, userStored) => {
                                if(err) return res.status(500).send({ message: 'Error al guardar el usuario.'});
                                if(userStored){
                                    res.status(200).send({user: userStored});
                                }else{
                                    res.status(404).send({message: 'No se ha registrado el usuario.'});
                                }
                            })
                        });
                    }
                });


    }else{
        res.status(200).send({
            message: 'Completa todos los campos necesarios.'
        })
    }
}

function loginUsuario(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición.'});
        if(usuario){
            bcrypt.compare(password, usuario.password, (err, check) => {
                if(check){
                    if(params.gettoken){
                        return res.status(200).send({
                            token: jwt.createToken(usuario)
                        });
                    }else{
                        usuario.password = undefined;
                        return res.status(200).send({usuario});
                    }
                    
                }else{
                    return res.status(404).send({message: 'El usuario no se ha podido identificar.'});
                }
            });
        }else{
            return res.status(404).send({message: 'El usuario no se ha podido identificar.'});
        }
    });
}

function getUsuario(req, res){
    var usuarioId = req.params.id;

    User.findById(usuarioId, (err, usuario) => {
        if(err) return res.status(500).send({message: 'Error en la petición.'});
        if(!usuario) return res.status(404).send({message: 'El usuario no existe.'});
    
        seguirUsuario(req.user.sub, usuarioId).then((valor) => {
            return res.status(200).send({usuario, 
                                        "siguiendo": valor.siguiendo,
                                        "seguidos": valor.seguidos});
        });

    });
}

async function seguirUsuario(identidadUsuario, usuarioId){
    var siguiendo = await Follow.findOne({"user":identidadUsuario, "followed":usuarioId}).then((siguiendo) => {
        return siguiendo;
    });
    
    var seguido = await Follow.findOne({"user":usuarioId, "followed":identidadUsuario}).then((seguido) => {
        return seguido;
    }); 

    return{
       siguiendo:siguiendo,
       seguidos:seguido
    }
}

function getUsuarios(req, res){
    var idUsuario = req.user.sub;
    var pagina = 1;
    var itemsPorPagina = 5;

    if(req.params.pagina){
        pagina = req.params.pagina;
    }

    User.find().sort('_id').paginate(pagina, itemsPorPagina, (err, usuarios, total) => {
        if(err) return res.status(500).send({message: 'Error en la petición.'});
        if(!usuarios) return res.status(404).send({message: 'No hay usuarios disponibles'});

        usuariosSeguidosId(idUsuario).then((valor) => {
            
            return res.status(200).send({
                usuarios,
                usuariosQueSigo: valor.siguiendo,
                usuariosQueMeSiguen: valor.meSiguen,
                total,
                paginas: Math.ceil(total/itemsPorPagina)
            });
        });

    });

}

async function usuariosSeguidosId(usuarioId){
    var estoySiguiendo = [];
    var meEstanSiguiendo = [];

    var siguiendo = await Follow.find({"user":usuarioId}).select({"_id":0, "_v":0, "user":0}).then((siguiendo) => {
        return siguiendo;
    });

    var meSiguen = await Follow.find({"followed":usuarioId}).select({"_id":0, "_v":0, "followed":0}).then((meSiguen) => {
        return meSiguen;
    });

    siguiendo.forEach((follow) => {
        estoySiguiendo.push(follow.followed);
    });

    meSiguen.forEach((follow) => {
        meEstanSiguiendo.push(follow.user);
    });

    return{
        siguiendo: estoySiguiendo,
        meSiguen: meEstanSiguiendo
    }
}

function contadores(req, res){
    var usuarioId = req.user.sub;
    if(req.params.id){
        usuarioId = req.params.id;
    }
    
    contadorFollow(usuarioId).then((valor) => {
        return res.status(200).send(valor);
    });
    
}

async function contadorFollow(usuarioId){
    var siguiendo = await Follow.count({"user":usuarioId}).then((siguiendo) => {
        return siguiendo;
    });

    var meSiguen = await Follow.count({"followed":usuarioId}).then((meSiguen) => {
        return meSiguen;
    });

    return {
        siguiendo: siguiendo,
        meSiguen: meSiguen
    }
}

function updateUsuarios(req, res){
    var usuarioId = req.params.id;
    var actualizar = req.body;

    delete actualizar.password;

    if(usuarioId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para actualizar los datos del usuario.'});
    }

    User.findByIdAndUpdate(usuarioId, actualizar, {new:true}, (err, usuarioActualizado) => {
        
        if(err) return res.status(500).send({message: 'Error en la petición.'});
        if(!usuarioActualizado) return res.status(404).send({message: 'No se ha podido actualizar el usuario.'});

        return res.status(200).send({user: usuarioActualizado});
    });
}

function subirImagen(req, res){
    var usuarioId = req.params.id;
    console.log(req.files);
    if(req.files){
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var nombreImagen = fileSplit[2];
        var extensionSplit = nombreImagen.split('\.');
        var imagenExt = extensionSplit[1];

        if(usuarioId != req.user.sub){
            return borrarImagenesOUploads(res, filePath, 'No tienes permiso para actualizar los datos del usuario.');
        }

        if(imagenExt == 'png' || imagenExt == 'jpg' || imagenExt == 'jpeg' || imagenExt == 'gif'){
            User.findByIdAndUpdate(usuarioId, {imagen: nombreImagen}, {new:true}, (err, usuarioActualizado) => {
                if(err) return res.status(500).send({message: 'Error en la petición.'});
                if(!usuarioActualizado) return res.status(404).send({message: 'No se ha podido actualizar el usuario.'});
    
                return res.status(200).send({user: usuarioActualizado});
            });
        }else{
            return borrarImagenesOUploads(res, filePath, 'Extensión no válida.');
        }

    }else{
        return res.status(200).send({message: 'No se han subido imágenes.'});
    }
}

function getImagen(req, res){
    var archivo = req.params.imageFile;
    var pathArchivo = './uploads/usuarios/'+archivo;

    fs.exists(pathArchivo, (exists) => {
        if(exists){
            res.sendFile(path.resolve(pathArchivo));
        }else{
            res.status(200).send({message: 'No existe la imagen.'});
        }
    })
}

function borrarImagenesOUploads(res, filePath, message){
    fs.unlink(filePath, (err) => {
        return res.status(200).send({message: message});
        });
}

module.exports = {
    inicio, 
    pruebas, 
    saveUsuario,
    loginUsuario,
    getUsuario,
    getUsuarios,
    updateUsuarios,
    subirImagen,
    getImagen,
    contadores
}