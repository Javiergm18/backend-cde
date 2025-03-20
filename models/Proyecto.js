const mongoose = require("mongoose");

const ProyectoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    entidadOrganizadora: { type: String, required: true },
    fechaApertura: { type: Date, required: true },
    fechaCierre: { type: Date, required: true },
    objetivo: { type: String, required: true },
    publicoObjetivo: { type: String, required: true },
    estado: { type: String, required: true, enum: ["Abierta", "En evaluación", "Cerrada", "En ejecución"] },
    enlaceInscripcion: String,
    contactoReferencia: {
        nombre: String,
        telefono: String,
        email: String
    },
    evidencias: { type: [String], default: [] }
});

module.exports = mongoose.model("Proyecto", ProyectoSchema);
