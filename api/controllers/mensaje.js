"use strict";

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user');
var Follow = require('../models/follow');
var Mensaje = require('../models/mensaje');

function saveMensaje(req, res){
    var params = req.body;
    var mensaje = new Mensaje();

    if(!params.text || !params.receiver) return res.status(200).send({message: "Es necesario completar todos los datos."});
    mensaje.emitter = req.user.sub;
    mensaje.receiver = params.receiver;
    mensaje.text = params.text;
    mensaje.created_at = moment().unix();
    mensaje.viewed = "false";
    mensaje.save((err, mensajeGuardado) => {
       if(err) return res.status(500).send({message: "Se ha producido un error."});
       if(!mensajeGuardado) return res.status(500).send({message: "Se ha producido un error."});

       return res.status(200).send({message: mensajeGuardado});
    });
}

function getMensajesRecibidos(req, res){
    var ususarioId = req.user.sub;
    var pagina = 1;
    var itemsPorPagina = 4;

    if(req.params.pagina){
        pagina = req.params.pagina;
    }

    Mensaje.find({receiver: ususarioId}).populate('emitter', 'alias imagen').paginate(pagina, itemsPorPagina, (err, mensajes, total) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        if(!mensajes) return res.status(500).send({message: "No hay mensajes."});

        return res.status(200).send({
            total: total,
            paginas: Math.ceil(total/itemsPorPagina),
            mensajes
        });
    });
}

function getMensajesEnviados(req, res){
    var ususarioId = req.user.sub;
    var pagina = 1;
    var itemsPorPagina = 4;

    if(req.params.pagina){
        pagina = req.params.pagina;
    }

    Mensaje.find({emitter: ususarioId}).populate('emitter receiver', 'alias imagen').paginate(pagina, itemsPorPagina, (err, mensajes, total) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        if(!mensajes) return res.status(500).send({message: "No hay mensajes."});

        return res.status(200).send({
            total: total,
            paginas: Math.ceil(total/itemsPorPagina),
            mensajes
        });
    });
}

function getMensajesNoVistos(req, res){
    var ususarioId = req.user.sub;

    Mensaje.count({receiver:ususarioId, viewed: "false"}).exec((err, contador) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        return res.status(200).send({
            'noVIsto': contador
        })
    });
}

function marcarComoLeidos(req, res){
    var ususarioId = req.user.sub;

    Mensaje.update({receiver:ususarioId, viewed:'false'}, {viewed:'true'}, {"multi":true}, (err, mensajesActualizados) => {
        if(err) return res.status(500).send({message: "Se ha producido un error."});
        return res.status(200).send({
            mensajes: mensajesActualizados
        });
    });
}

module.exports = {
    saveMensaje,
    getMensajesRecibidos,
    getMensajesEnviados,
    getMensajesNoVistos,
    marcarComoLeidos    
}