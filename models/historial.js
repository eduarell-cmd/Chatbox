const mongoose = require('mongoose');

const historialSchema = new mongoose.Schema({
  mensaje: String,
  respuesta: String,
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('historial', historialSchema);
