const mongoose = require('mongoose');

const formacionContinuaSchema = new mongoose.Schema({
    nombreCurso: String,
    objetivoPrograma: String,
    descripcionContenido: String,
    duracion: Number, // en horas
    modalidad: String, // presencial, virtual, híbrida
    publicoObjetivo: String,
    fechaInicio: Date,
    fechaFinalizacion: Date,
    docenteFacilitador: String,
    datosContactoDocente: {
        telefono: String,
        correoElectronico: String
    },
    numeroParticipantesEsperados: Number,
    entidadAliada: String, // si aplica
    materialesRecursosNecesarios: [String],
    costo: Number, // si aplica
    observaciones: String,
    evidenciasDocumentos: [String], // enlaces o nombres de archivos
    generacionDatosEstadisticos: Object // Para análisis y reportes
}, { collection: 'FormacionContinua' });

module.exports = mongoose.model('FormacionContinua', formacionContinuaSchema);