const mongoose = require('mongoose');

const practicaEmprendimientoSchema = new mongoose.Schema({
    fechaSolicitud: Date,
    modalidadPractica: String, // Creación de empresa, fortalecimiento empresarial, practicante
    nombreEstudiante: String,
    idEstudiante: String,
    facultad: String,
    nombreEmpresaIniciativa: String,
    nombreCoordinadorPractica: String,
    nombreDirectorPractica: String,
    fechaInicio: Date,
    fechaFinalizacion: Date,
    fechaSustentacionSTG: Date,
    seguimiento: {
        arteproyecto: String,
        primerInforme: String,
        segundoInforme: String
    },
    observaciones: String,
    evidencias: [{
        contenido: String,   // Base64 con prefijo data:...;base64,...
        nombre: String,      // Nombre original del archivo, ej. "foto1.png"
        tipo: String,        // Tipo MIME, ej. "data:image/png"
        tamaño: Number       // Tamaño en bytes (opcional pero útil)
    }],
}, { collection: 'PracticasEmprendimiento' });

module.exports = mongoose.model('PracticasEmprendimiento', practicaEmprendimientoSchema);