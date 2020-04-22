"use strict";

var express = require('express');
var MensajeController = require('../controllers/mensaje');
var api = express.Router();
var mdAuth = require('../middlewares/autenticacion');

api.post('/mensaje', mdAuth.ensureAuth, MensajeController.saveMensaje);
api.get('/misMensajes/:pagina?', mdAuth.ensureAuth, MensajeController.getMensajesRecibidos);
api.get('/misMensajesEnviados/:pagina?', mdAuth.ensureAuth, MensajeController.getMensajesEnviados);
api.get('/mensajesSinVer', mdAuth.ensureAuth, MensajeController.getMensajesNoVistos);
api.get('/marcarLeido', mdAuth.ensureAuth, MensajeController.marcarComoLeidos);

module.exports = api;