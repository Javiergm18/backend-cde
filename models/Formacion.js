const mongoose = require("mongoose");

const FormacionSchema = new mongoose.Schema({
    nombreCurso: { type: String, required: true },
    objetivo: { type: String, required: true },
    descripcion: { type: String, required: true },
    duracionHoras: { type: Number, required: true },
    modalidad: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    docente: {
        nombre: String,
        telefono: String,
        email: String
    },
    participantesEsperados: { type: Number, required: true },
    entidadAliada: String,
    materiales: String,
    costo: { type: Number, default: 0 }
});

module.exports = mongoose.model("Formacion", FormacionSchema);
