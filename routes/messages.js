const express = require('express');
const router = express.Router();
const Respuesta = require('../models/Respuesta');
const historial = require('../models/historial');

const patrones = [
  { clave: "saludo", regex: /\b(hola|buenas|hey|hello|q onda|holi|ola|oli|q show)\b/i },
  { clave: "emociones", regex: /\b(qué|cuáles|cuales|es cierto que|puedes|sabes)?\s*(emociones|sentimientos)\b.*\b(manejas|detectas|reconoces|lees|procesas|usas|analizas|describes|muestras|sabes|interpreta(s)?)\b|\b(manejas|detectas|reconoces|lees|procesas|usas|analizas|describes|muestras|sabes|interpreta(s)?)\b.*\b(emociones|sentimientos)\b/i },
  { clave: "enojo", regex: /\b(enojo|enojado|molesto|ira|rabia|furia)\b/i },
  { clave: "disgusto", regex: /\b(disgusto|asco|repulsión|desagrado|me desagrada)\b/i },
  { clave: "miedo", regex: /\b(miedo|temor|pánico|me asusta|asustado|ansiedad)\b/i },
  { clave: "felicidad", regex: /\b(feliz|felicidad|alegría|contento|me siento bien)\b/i },
  { clave: "tristeza", regex: /\b(triste|tristeza|deprimido|melancolía|desanimado|llorando)\b/i },
  { clave: "sorpresa", regex: /\b(sorpresa|sorprendido|inesperado|me sorprendió|sorprendente)\b/i },
  { clave: "neutral", regex: /\b(neutral|normal|me siento bien|me siento ok|ni bien ni mal|meh)\b/i },
  { clave: "funcionamiento", regex: /\b(manual|guía|instrucciones|ayuda|cómo usar|como funciona|uso|funciona)\b/i }
];

let esperandorespuesta = false;
let esperandoTecnica = null;

router.post('/', async (req, res) => {
  const mensaje = req.body?.mensaje?.toLowerCase();

  if (!mensaje) {
    return res.status(400).json({ error: 'No enviaste mensaje' });
  }

  // Si esperamos respuesta de técnicas
  if (esperandoTecnica) {
    if (/\b(sí|si|claro|dale|va|ok|porfa)\b/.test(mensaje)) {
      const claveTecnica = "T" + esperandoTecnica;
      esperandoTecnica = null;
      const tecnica = await Respuesta.findOne({ clave: claveTecnica });
      const respuestaTexto = tecnica?.respuesta || "No encontré técnicas para esa emoción 😕";

      await historial.create({ mensajeUsuario: mensaje, respuestaBot: respuestaTexto });
      return res.json({ respuesta: respuestaTexto });
    }
    if (/\b(no|nop|nel|noup|nanais|ni madres)\b/.test(mensaje)) {
      esperandoTecnica = null;
      const respuestaTexto = "Va, si necesitas algo más, aquí estoy";
      await historial.create({ mensajeUsuario: mensaje, respuestaBot: respuestaTexto });
      return res.json({ respuesta: respuestaTexto });
    }
    const respuestaTexto = "Por favor responde sí o no a la pregunta sobre técnicas.";
    await historial.create({ mensajeUsuario: mensaje, respuestaBot: respuestaTexto });
    return res.json({ respuesta: respuestaTexto });
  }

  // Si esperamos respuesta de emociones
  if (esperandorespuesta) {
    if (/\b(sí|si|claro|dale|va|ok|porfa)\b/.test(mensaje)) {
      esperandorespuesta = false;
      const emociones = ["enojo", "disgusto", "miedo", "felicidad", "tristeza", "sorpresa", "neutral"];
      const emocionRandom = emociones[Math.floor(Math.random() * emociones.length)];
      const consejo = await Respuesta.findOne({ clave: emocionRandom });
      const texto = `Por ejemplo, si detecto ${emocionRandom}, te diría: ${consejo?.respuesta || 'No encontré consejo.'} ¿Quieres unas técnicas de regulación?`;

      esperandoTecnica = emocionRandom;
      await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
      return res.json({ respuesta: texto });
    }
    if (/\b(no|nop|nel|noup|nanais|ni madres)\b/.test(mensaje)) {
      esperandorespuesta = false;
      const texto = "¡Entiendo! ¿Te puedo ayudar con algo más?";
      await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
      return res.json({ respuesta: texto });
    }
    const texto = "Por favor responde sí o no a la pregunta sobre emociones.";
    await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
    return res.json({ respuesta: texto });
  }

  // Si pregunta por emociones
  if (/\b(emociones?|sentimientos?)\b.*\b(manejas|detectas|reconoces|lees|procesas|usas|tomas en cuenta)\b|\b(manejas|detectas|reconoces|lees|procesas|usas)\b.*\b(emociones?|sentimientos?)\b/.test(mensaje)) {
    esperandorespuesta = true;
    const respuesta = await Respuesta.findOne({ clave: "emociones" });
    const texto = respuesta?.respuesta || "Sí, detecto emociones.";

    await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
    return res.json({ respuesta: texto });
  }

  // Buscar en patrones normales
  const encontrado = patrones.find(p => p.regex.test(mensaje));
  if (!encontrado) {
    const texto = "Lo siento, no entendí eso.";
    await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
    return res.json({ respuesta: texto });
  }

  try {
    const respuesta = await Respuesta.findOne({ clave: encontrado.clave });

    if (encontrado.clave === "manual" && respuesta?.respuesta) {
      const pdfBase64 = respuesta.respuesta;
      const link = `data:application/pdf;base64,${pdfBase64}`;
      const texto = `Aquí tienes el manual en PDF: <a href="${link}" target="_blank">Ver PDF</a>`;

      await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
      return res.json({ respuesta: texto });
    }

    const texto = respuesta?.respuesta || "No encontré una respuesta para eso.";
    await historial.create({ mensajeUsuario: mensaje, respuestaBot: texto });
    return res.json({ respuesta: texto });

  } catch (error) {
    console.error('Error DB:', error);
    return res.status(500).json({ error: 'Error interno en base de datos' });
  }
});

module.exports = router;
