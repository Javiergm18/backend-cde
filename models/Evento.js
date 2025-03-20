const mongoose = require("mongoose");

const EventoSchema = new mongoose.Schema({
    entidadOrganizadora: { type: String, required: true },
    fecha: { type: Date, required: true },
    tipoActividad: { type: String, required: true },
    tema: { type: String, required: true },
    conferencista: {
        nombre: String,
        telefono: String,
        email: String
    },
    asistentes: { type: Number, default: 0 },
    modalidad: { type: String, required: true }
});

module.exports = mongoose.model("Evento", EventoSchema);
