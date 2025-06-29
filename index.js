const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const messageRoutes = require('./routes/messages');
const historialRoutes = require('./routes/historial'); 

const app = express();
const PORT = 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/messages', messageRoutes);
app.use('/historial', historialRoutes); 

app.listen(PORT, () => {
  console.log("Jalando");
});
