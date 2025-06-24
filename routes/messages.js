const express = require('express');
const router = express.Router();
const Respuesta = require('../models/Respuesta');

const patrones = [
  { clave: "saludo", regex: /\b(hola|buenas|hey|hello|q onda|holi|ola|oli|q onda)\b/i },
];

router.post('/', async (req, res) => {
  const mensaje = req.body?.mensaje;

  if (!mensaje) {
    console.log('No se recibió mensaje');
    return res.status(400).json({ error: 'No enviaste mensaje' });
  }

  const encontrado = patrones.find(p => p.regex.test(mensaje));

  if (!encontrado) {
    console.log('No coincidió patrón para:', mensaje);
    return res.json({ respuesta: "Lo siento, no entendí eso." });
  }

  try {
    const respuesta = await Respuesta.findOne({ clave: encontrado.clave });
    console.log('Respuesta DB:', respuesta);
    return res.json({ respuesta: respuesta?.respuesta || "No encontré una respuesta para eso." });
  } catch (error) {
    console.error('Error DB:', error);
    return res.status(500).json({ error: 'Error interno en base de datos' });
  }
});


module.exports = router;
