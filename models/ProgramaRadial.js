const mongoose = require("mongoose");

const ProgramaRadialSchema = new mongoose.Schema({
    fechaEntrevista: { type: Date, required: true },
    medioTransmision: { type: String, required: true },
    entrevistador: { type: String, required: true },
    entrevistado: {
        nombre: String,
        cargo: String,
        empresa: String,
        telefono: String,
        email: String
    }
});

module.exports = mongoose.model("ProgramaRadial", ProgramaRadialSchema);
