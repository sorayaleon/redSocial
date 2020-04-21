"use strict";

//var path = require("path");
//var fs = require("fs");
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Follow = require('../models/follow');

function seguir (req, res){
    var params = req.body;
    var follow = new Follow();
    
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) => {
        if(err) return res.status(500).send({message: "Error al guardar el seguimiento."});
        if(!followStored) return res.status(404).send({message: "El seguimiento no se ha guardado."});
        return res.status(200).send({followed:followStored});
    });
}

function dejarDeSeguir(req, res){
    var usuarioId = req.user.sub;
    var siguiendoId = req.params.id;

    Follow.find({"user":usuarioId, "followed":siguiendoId}).remove(err => {
        if(err) return res.status(500).send({message: "Error al dejar de seguir."});
        return res.status(200).send({message: "Has dejado de seguir al usuario."});
    });
}

function listarUsuariosSeguidos(req, res){
    var usuarioId = req.user.sub;
    var pagina = 1;
    var itemsPorPagina = 4;

    if(req.params.id && req.params.pagina){
        usuarioId = req.params.id;
    }

    if(req.params.pagina){
        pagina = req.params.pagina;
    }else{
        pagina = req.params.id;
    }

    Follow.find({user:usuarioId}).populate("user followed").paginate(pagina, itemsPorPagina, (err, follows, total) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        if(!follows) return res.status(404).send({message: "No sigues a ningún usuario."});

        return res.status(200).send({
            total: total,
            paginas: Math.ceil(total/itemsPorPagina),
            follows
        });
    });
}

function listarSeguidores(req, res){
    var usuarioId = req.user.sub;
    var pagina = 1;
    var itemsPorPagina = 4;

    if(req.params.id && req.params.pagina){
        usuarioId = req.params.id;
    }

    if(req.params.pagina){
        pagina = req.params.pagina;
    }else{
        pagina = req.params.id;
    }

    Follow.find({followed:usuarioId}).populate({path: "followed"}).paginate(pagina, itemsPorPagina, (err, follows, total) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        if(!follows) return res.status(404).send({message: "No tienes seguidores."});

        return res.status(200).send({
            total: total,
            paginas: Math.ceil(total/itemsPorPagina),
            follows
        });
    });
}

function listadoUsuarios(req, res){
    var usuarioId = req.user.sub;

    var buscar = Follow.find({user: usuarioId});
    
    if(req.params.followed){
        var buscar = Follow.find({followed: usuarioId});
    }
    
    buscar.populate("user followed").exec((err, follows) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        if(!follows) return res.status(404).send({message: "No sigues a ningún usuario."});

        return res.status(200).send({ follows });
    });
}

module.exports = {
    seguir,
    dejarDeSeguir,
    listarUsuariosSeguidos,
    listarSeguidores,
    listadoUsuarios
}