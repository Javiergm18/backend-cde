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
    evidencias: [{
        contenido: String,   // Base64 con prefijo data:...;base64,...
        nombre: String,      // Nombre original del archivo, ej. "foto1.png"
        tipo: String,        // Tipo MIME, ej. "data:image/png"
        tamaño: Number       // Tamaño en bytes (opcional pero útil)
    }],

}, { collection: 'FormacionContinua' });

module.exports = mongoose.model('FormacionContinua', formacionContinuaSchema);