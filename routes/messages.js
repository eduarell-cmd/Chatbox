const express = require('express');
const router = express.Router();
const Respuesta = require('../models/Respuesta');

const patrones = [
  { clave: "saludo", regex: /\b(hola|buenas|hey|hello|q onda|holi|ola|oli|q show)\b/i },
  { clave: "emociones", regex: /\b(qué|cuáles|cuales|es cierto que|puedes|sabes)?\s*(emociones|sentimientos)\b.*\b(manejas|detectas|reconoces|lees|procesas|usas|analizas|describes|muestras|sabes|interpreta(s)?)\b|\b(manejas|detectas|reconoces|lees|procesas|usas|analizas|describes|muestras|sabes|interpreta(s)?)\b.*\b(emociones|sentimientos)\b/i},
  { clave: "enojo", regex: /\b(enojo|enojado|molesto|ira|rabia|furia)\b/i},
  { clave: "disgusto", regex: /\b(disgusto|asco|repulsión|desagrado|me desagrada)\b/i},
  { clave: "miedo", regex: /\b(miedo|temor|pánico|me asusta|asustado|ansiedad)\b/i},
  { clave: "felicidad", regex: /\b(feliz|felicidad|alegría|contento|me siento bien)\b/i},
  { clave: "tristeza", regex: /\b(triste|tristeza|deprimido|melancolía|desanimado|llorando)\b/i},
  { clave: "sorpresa", regex: /\b(sorpresa|sorprendido|inesperado|me sorprendió|sorprendente)\b/i},
  { clave: "neutral", regex: /\b(neutral|normal|me siento bien|me siento ok|ni bien ni mal|meh)\b/i},
  { clave: "manual", regex: /\b(manual|guía|instrucciones|ayuda|cómo usar|como funciona|uso|funciona)\b/i}
];

let esperandorespuesta = false;
let esperandoTecnica = null;

router.post('/', async (req, res) => {
  const mensaje = req.body?.mensaje?.toLowerCase();

  console.log('Mensaje:', mensaje);
  console.log('esperandorespuesta:', esperandorespuesta);
  console.log('esperandoTecnica:', esperandoTecnica);

  if (!mensaje) {
    return res.status(400).json({ error: 'No enviaste mensaje' });
  }

  // Primero verificamos si esperamos respuesta de técnicas
  if (esperandoTecnica) {
    if (/\b(sí|si|claro|dale|va|ok|porfa)\b/.test(mensaje)) {
      const claveTecnica = "T" + esperandoTecnica;
      esperandoTecnica = null;

      const tecnica = await Respuesta.findOne({ clave: claveTecnica });
      return res.json({
        respuesta: tecnica?.respuesta || "No encontré técnicas para esa emoción 😕"
      });
    }
    if (/\b(no|nop|nel|noup|nanais|ni madres)\b/.test(mensaje)) {
      esperandoTecnica = null;
      return res.json({ respuesta: "Va, si necesitas algo más, aquí estoy" });
    }
    return res.json({ respuesta: "Por favor responde sí o no a la pregunta sobre técnicas." });
  }

  // Luego verificamos si esperamos respuesta de emociones
  if (esperandorespuesta) {
    if (/\b(sí|si|claro|dale|va|ok|porfa)\b/.test(mensaje)) {
      esperandorespuesta = false;

      const emociones = ["enojo", "disgusto", "miedo", "felicidad", "tristeza", "sorpresa", "neutral"];
      const emocionRandom = emociones[Math.floor(Math.random() * emociones.length)];
      const consejo = await Respuesta.findOne({ clave: emocionRandom });

      esperandoTecnica = emocionRandom;

      return res.json({
        respuesta: `Por ejemplo, si detecto ${emocionRandom}, te diría: ${consejo?.respuesta || 'No encontré consejo.'} ¿Quieres unas técnicas de regulación?`
      });
    }
    if (/\b(no|nop|nel|noup|nanais|ni madres)\b/.test(mensaje)) {
      esperandorespuesta = false;
      return res.json({ respuesta: "¡Entiendo! ¿Te puedo ayudar con algo más?" });
    }
    return res.json({ respuesta: "Por favor responde sí o no a la pregunta sobre emociones." });
  }

  // Detecta si pregunta sobre emociones para activar primer estado
  if (/\b(emociones?|sentimientos?)\b.*\b(manejas|detectas|reconoces|lees|procesas|usas|tomas en cuenta)\b|\b(manejas|detectas|reconoces|lees|procesas|usas)\b.*\b(emociones?|sentimientos?)\b/.test(mensaje)) {
    esperandorespuesta = true;
    const respuesta = await Respuesta.findOne({ clave: "emociones" });
    return res.json({ respuesta: respuesta?.respuesta || "Sí, detecto emociones." });
  }

  // Busca otras claves en patrones normales
  const encontrado = patrones.find(p => p.regex.test(mensaje));

  if (!encontrado) {
    return res.json({ respuesta: "Lo siento, no entendí eso." });
  }

try {
  const respuesta = await Respuesta.findOne({ clave: encontrado.clave });

  // Si la clave es "manual", asumimos que la respuesta es un PDF en base64
  if (encontrado.clave === "manual" && respuesta?.respuesta) {
    const pdfBase64 = respuesta.respuesta;
    const link = `data:application/pdf;base64,${pdfBase64}`;
    return res.json({
      respuesta: `Aquí tienes el manual en PDF: <a href="${link}" target="_blank">Ver PDF</a>`
    });
  }

  return res.json({
    respuesta: respuesta?.respuesta || "No encontré una respuesta para eso."
  });
} catch (error) {
  console.error('Error DB:', error);
  return res.status(500).json({ error: 'Error interno en base de datos' });
}
});

module.exports = router;
