const mongoose = require('mongoose');

const eventoCharlaSchema = new mongoose.Schema({
    entidadOrganizadora: String,
    fechaEvento: Date,
    tipoActividad: String, // charla, taller, evento, brigada
    tema: String,
    nombreConferencista: String,
    publicoObjetivo: String,
    numeroAsistentes: Number,
    horaInicio: String,
    duracion: Number, // en horas
    modalidad: String, // presencial, virtual, híbrida
    observaciones: String,
    evidencias: [{
        contenido: String,   // Base64 con prefijo data:...;base64,...
        nombre: String,      // Nombre original del archivo, ej. "foto1.png"
        tipo: String,        // Tipo MIME, ej. "data:image/png"
        tamaño: Number       // Tamaño en bytes (opcional pero útil)
    }],
    generacionDatosEstadisticos: Object // Puede contener información adicional de estadísticas
}, { collection: 'EventosCharlas' });

module.exports = mongoose.model('EventoCharla', eventoCharlaSchema);