const express = require('express');
const router = express.Router();
const Message = require('../models/models'); // si el archivo se llama models.js

// Obtener mensajes
router.get('/', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

// Enviar mensaje
router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'El mensaje está vacío' });

  const newMessage = new Message({ text });
  await newMessage.save();
  res.status(201).json(newMessage);
});

module.exports = router;
