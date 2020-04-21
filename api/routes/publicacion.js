"use strict";

var express = require("express");
var PublicacionController = require("../controllers/publicacion");
var api = express.Router();
var mdAuth = require("../middlewares/autenticacion");
var multipart = require('connect-multiparty');
var mdUpload = multipart({uploadDir: './uploads/publicacion'});

api.post('/publicacion', mdAuth.ensureAuth, PublicacionController.savePublicacion);
api.get('/publicaciones/:pagina?', mdAuth.ensureAuth, PublicacionController.getPublicaciones);
api.get('/publicacion/:id', mdAuth.ensureAuth, PublicacionController.getPublicacion);
api.delete('/publicacion/:id', mdAuth.ensureAuth, PublicacionController.deletePublicacion);
api.post('/subirImagenPublicacion/:id', [mdAuth.ensureAuth, mdUpload], PublicacionController.subirImagen);
api.get('/getImagenPublicacion/:imageFile', PublicacionController.getImagen);

module.exports = api;