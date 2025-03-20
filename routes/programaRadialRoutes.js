const express = require("express");
const router = express.Router();
const ProgramaRadial = require("../models/ProgramaRadial");

// Crear una entrevista radial
router.post("/", async (req, res) => {
    try {
        const nuevaEntrevista = new ProgramaRadial(req.body);
        await nuevaEntrevista.save();
        res.status(201).json(nuevaEntrevista);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar entrevista", error });
    }
});

// Obtener todas las entrevistas
router.get("/", async (req, res) => {
    try {
        const entrevistas = await ProgramaRadial.find();
        res.json(entrevistas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener entrevistas", error });
    }
});

module.exports = router;
