"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var mensajeSchema = schema({
    emisor: {type: Schema.ObjectId,  ref: 'User'},
    receptor: {type: Schema.ObjectId,  ref: 'User'},
    texto: String,
    created_at: String
});

module.exports = mongoose.model('Mensaje', mensajeSchema);