const express = require('express');
const router = express.Router();
const Respuesta = require('../models/Respuesta');

const patrones = [
  { clave: "saludo", regex: /\b(hola|buenas|hey|hello|q onda|holi|ola|oli|q show)\b/i },
  { clave: "emociones", regex: /\b(emociones?|sentimientos?)\b.*\b(manejas|detectas|reconoces|lees|procesas|usas|tomas en cuenta)\b|\b(manejas|detectas|reconoces|lees|procesas|usas)\b.*\b(emociones?|sentimientos?)\b/i},
  { clave: "enojo", regex: /\b(enojo|enojado|molesto|ira|rabia|furia)\b/i},
  { clave: "disgusto", regex: /\b(disgusto|asco|repulsión|desagrado|me desagrada)\b/i},
  { clave: "miedo", regex: /\b(miedo|temor|pánico|me asusta|asustado|ansiedad)\b/i},
  { clave: "felicidad", regex: /\b(feliz|felicidad|alegría|contento|me siento bien)\b/i},
  { clave: "tristeza", regex: /\b(triste|tristeza|deprimido|melancolía|desanimado|llorando)\b/i},
  { clave: "sorpresa", regex: /\b(sorpresa|sorprendido|inesperado|me sorprendió|sorprendente)\b/i},
  { clave: "neutral", regex: /\b(neutral|normal|me siento bien|me siento ok|ni bien ni mal|meh)\b/i}
];

let esperandorespuesta = false;

router.post('/', async (req, res) => {
  const mensaje = req.body?.mensaje;

  if (!mensaje) {
    console.log('No se recibió mensaje');
    return res.status(400).json({ error: 'No enviaste mensaje' });
  }
  
  if (esperandorespuesta && /\b(sí|si|claro|dale|va|ok|porfa)\b/.test(mensaje)) {
    esperandoEjemplo = false;

    // Lista de claves de emociones
    const emociones = ["enojo", "disgusto", "miedo", "felicidad", "tristeza", "sorpresa", "neutral"];
    const emocionRandom = emociones[Math.floor(Math.random() * emociones.length)];
    const consejo = await Respuesta.findOne({ clave: emocionRandom });

    return res.json({
      respuesta: `Por ejemplo, si detecto ${emocionRandom}, te diría: ${consejo?.respuesta || 'No encontré consejo.'}`
    });
  }
  
  const encontrado = patrones.find(p => p.regex.test(mensaje));

  if (!encontrado) {
    console.log('No coincidió patrón para:', mensaje);
    return res.json({ respuesta: "Lo siento, no entendí eso." });
  }

  if (encontrado.clave === "emociones") {
    esperandorespuesta = true;
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
