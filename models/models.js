import mongoose from 'mongoose';

const respuestaSchema = new mongoose.Schema({
  clave: String,
  respuesta: String
});

export const Respuesta = mongoose.model("Respuesta", respuestaSchema);
