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
    evidenciasFotograficas: [String],
    evidenciasDocumentos: [String], // Enlaces o nombres de archivos
    generacionDatosEstadisticos: Object // Para análisis y reportes
}, { collection: 'PracticasEmprendimiento' });

module.exports = mongoose.model('PracticasEmprendimiento', practicaEmprendimientoSchema);