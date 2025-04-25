const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Conexión a la base de datos MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.log(err));

// Rutas
const emprendedoresRoutes = require('./routes/emprendedores');
const empresasRoutes = require('./routes/empresas');
const eventosCharlasRoutes = require('./routes/eventosCharlas');
const formacionContinuaRoutes = require('./routes/formacionContinua');
const practicasEmprendimientoRoutes = require('./routes/practicasEmprendimiento');
const programaRadialRoutes = require('./routes/programaRadial');
const proyectosRoutes = require('./routes/proyectos');
const loginRoutes = require('./routes/login');

app.use('/api/login', loginRoutes);
app.use('/api/emprendedores', emprendedoresRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/eventosCharlas', eventosCharlasRoutes);
app.use('/api/formacionContinua', formacionContinuaRoutes);
app.use('/api/practicasEmprendimiento', practicasEmprendimientoRoutes);
app.use('/api/programaRadial', programaRadialRoutes);
app.use('/api/proyectos', proyectosRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('¡Backend del CDE activo!');
  });