const mongoose = require('mongoose');

const respuestaSchema = new mongoose.Schema({
  clave: { type: String, required: true },
  respuesta: { type: String, required: true },
});

module.exports = mongoose.model('Respuesta', respuestaSchema);
