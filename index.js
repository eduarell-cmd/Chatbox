const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');

const app = express();
const PORT = 3000;

// Conexión a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Rutas
app.use('/messages', messageRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log("Jalando");
});
