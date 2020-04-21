"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var publicacionSchema = schema({
    text: String,
    imagen: String,
    created_at: String,
    user: { type: schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Publicacion', publicacionSchema);