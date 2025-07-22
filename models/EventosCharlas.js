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
    /*evidenciasFotograficas: [
    {
        nombre: String,
        tipo: String,
        contenido: String, // base64
        esVideo: String 
    }
    ],*/
    evidencias: [String],
    generacionDatosEstadisticos: Object // Puede contener información adicional de estadísticas
}, { collection: 'EventosCharlas' });

module.exports = mongoose.model('EventoCharla', eventoCharlaSchema);