
const express = require('express');
const router = express.Router();
const Historial = require('../models/historial');

router.get('/', async (req, res) => {
  try {
    const historialCompleto = await Historial.find().sort({ fecha: 1 });
    res.json(historialCompleto);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

module.exports = router;
