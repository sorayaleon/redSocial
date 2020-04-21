"use strict";

var express = require("express");
var FollowController = require("../controllers/follow");
var api = express.Router();
var mdAuth = require("../middlewares/autenticacion");

api.post("/follow", mdAuth.ensureAuth, FollowController.seguir);
api.delete("/follow/:id", mdAuth.ensureAuth, FollowController.dejarDeSeguir);
api.get("/siguiendo/:id?/:pagina?", mdAuth.ensureAuth, FollowController.listarUsuariosSeguidos);
api.get("/seguidores/:id?/:page?", mdAuth.ensureAuth, FollowController.listarSeguidores);
api.get("/misSeguidores/:followed?", mdAuth.ensureAuth, FollowController.listadoUsuarios);

module.exports = api;