const mongoose = require("mongoose");

const PracticaSchema = new mongoose.Schema({
    estudiante: {
        nombre: { type: String, required: true },
        idEstudiante: { type: String, required: true },
        facultad: { type: String, required: true }
    },
    empresa: { type: String, required: true },
    coordinador: { type: String, required: true },
    directorPractica: { type: String, required: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    estado: { type: String, required: true, enum: ["Registrada", "En Proceso", "Finalizada"] },
    evidencias: { type: [String], default: [] }
});

module.exports = mongoose.model("Practica", PracticaSchema);
