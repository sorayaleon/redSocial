"use strict";

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var mensajeSchema = schema({
    emitter: {type: schema.ObjectId,  ref: 'User'},
    receiver: {type: schema.ObjectId,  ref: 'User'},
    text: String,
    viewed: String,
    created_at: String
});

module.exports = mongoose.model('Mensaje', mensajeSchema);