const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true }
}, { collection: 'Usuario' });

module.exports = mongoose.model('Usuario', usuarioSchema);