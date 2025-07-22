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
    evidencias: [String],
    generacionDatosEstadisticos: Object // Para análisis y reportes
}, { collection: 'ProgramaRadial' });

module.exports = mongoose.model('ProgramaRadial', programaRadialSchema);