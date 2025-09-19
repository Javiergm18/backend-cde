const mongoose = require('mongoose');

const programaRadialSchema = new mongoose.Schema({
    fechaEntrevista: Date,
    horaEntrevista: String,
    medioTransmision: String, // Pregrado (Teams) o emisora
    nombreEntrevistador: String,
    nombreEntrevistado: String,
    carreraEntrevistado: String,
    tipoEntrevistado: String, // Alumno, empresario, egresado, particular
    cargo: String,
    nombreEmpresa: String, // Si aplica
    telefonoContacto: String,
    correoElectronico: String,
    evidencias: [{
        contenido: String,   // Base64 con prefijo data:...;base64,...
        nombre: String,      // Nombre original del archivo, ej. "foto1.png"
        tipo: String,        // Tipo MIME, ej. "data:image/png"
        tamaño: Number       // Tamaño en bytes (opcional pero útil)
    }],

}, { collection: 'ProgramaRadial' });

module.exports = mongoose.model('ProgramaRadial', programaRadialSchema);