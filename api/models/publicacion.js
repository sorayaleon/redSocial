"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var publicacionSchema = schema({
    texto: String,
    adjunto: String,
    created_at: String,
    user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Publicacion', publicacionSchema);