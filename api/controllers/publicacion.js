"use strict";

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var Publicacion = require('../models/publicacion');
var User = require('../models/user');
var Follow = require('../models/follow');

function savePublicacion(req, res){
    var params = req.body;
    var publicacion = new Publicacion();

    if(!params.text) return res.status(200).send({message: "Para hacer una publicación debes escribir algo."});
    publicacion.text = params.text;
    publicacion.file = 'null';
    publicacion.user = req.user.sub;
    publicacion.created_at = moment().unix();

    publicacion.save((err, publicacionAlmacenada) => {
        if(err) return res.status(500).send({message: "Se ha producido un error al guardar la publicación."});
        if(!publicacionAlmacenada) return res.status(404).send({message: "No se ha podido guardar la publicación."});
        
        return res.status(200).send({publicacion: publicacionAlmacenada});
    });

}

function getPublicaciones(req, res){
    var pagina = 1;
    var itemsPorPagina = 4;

    if(req.params.pagina){
        pagina = req.params.pagina;
    }

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) => {
        var seguidores = [];

        if(err) return res.status(500).send({message: "Se ha producido un error."});

        follows.forEach((follow) => {
            seguidores.push(follow.followed);
        });

        console.log(seguidores);

        Publicacion.find({user: {"$in": seguidores}}).sort('created_at').populate('user').paginate(pagina, itemsPorPagina, (err, publicaciones, total) => {
            if(err) return res.status(500).send({message: "Se ha producido un error."});
            console.log(publicaciones);
            if(!publicaciones) return res.status(404).send({message: "No hay publicaciones."});
            
            return res.status(200).send({
                total: total,
                paginas: Math.ceil(total/itemsPorPagina),
                pagina: pagina,
                publicaciones
            })
        });
    });

}

function getPublicacion (req, res){
    var idPublicacion = req.params.id;

    Publicacion.findById(idPublicacion, (err, publicacion) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        if(!publicacion) return res.status(404).send({message: "La publicación no existe."});

        return res.status(200).send({publicacion});
    });
}

function deletePublicacion(req, res){
    var idPublicacion = req.params.id;

    Publicacion.find({'user': req.user.sub, '_id': idPublicacion}).remove(err => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        
        return res.status(200).send({message: "La publicación ha sido eliminada."});
    });
}

function subirImagen(req, res){
    var publicacionId = req.params.id;
    
    if(req.files){
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var nombreImagen = fileSplit[2];
        var extensionSplit = nombreImagen.split('\.');
        var imagenExt = extensionSplit[1];

        if(imagenExt == 'png' || imagenExt == 'jpg' || imagenExt == 'jpeg' || imagenExt == 'gif'){
            Publicacion.findOne({'user':req.user.sub, '_id':publicacionId}).exec((err, publicacion) => {
                if(publicacion){
                    Publicacion.findByIdAndUpdate(publicacionId, {imagen: nombreImagen}, {new:true}, (err, publicacionActualizada) => {
                        if(err) return res.status(500).send({message: 'Error en la petición.'});
                        if(!publicacionActualizada) return res.status(404).send({message: 'No se ha podido actualizar la publicación.'});
            
                        return res.status(200).send({user: publicacionActualizada});
                    });
                }else{
                    return borrarImagenesOUploads(res, filePath, 'No tienes permiso para actualizar la publicación.');
                }
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
    var pathArchivo = './uploads/publicacion/'+archivo;

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
    savePublicacion,
    getPublicaciones,
    getPublicacion,
    deletePublicacion,
    subirImagen,
    getImagen
}