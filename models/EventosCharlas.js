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
    evidenciasFotograficas: [String], // enlaces o nombres de archivos
    generacionDatosEstadisticos: Object // Puede contener información adicional de estadísticas
}, { collection: 'EventosCharlas' });

module.exports = mongoose.model('EventoCharla', eventoCharlaSchema);