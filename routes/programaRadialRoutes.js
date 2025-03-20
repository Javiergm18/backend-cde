const express = require("express");
const router = express.Router();
const ProgramaRadial = require("../models/ProgramaRadial");

// Obtener todas las entrevistas
router.get("/", async (req, res) => {
    try {
        const entrevistas = await ProgramaRadial.find();
        res.json(entrevistas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener entrevistas", error });
    }
});

// Obtener una entrevista por ID
router.get("/:id", async (req, res) => {
    try {
        const entrevista = await ProgramaRadial.findById(req.params.id);
        if (!entrevista) return res.status(404).json({ message: "Entrevista no encontrada" });
        res.json(entrevista);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar entrevista", error });
    }
});

// Crear una entrevista
router.post("/", async (req, res) => {
    try {
        const nuevaEntrevista = new ProgramaRadial(req.body);
        await nuevaEntrevista.save();
        res.status(201).json(nuevaEntrevista);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar entrevista", error });
    }
});

// Actualizar una entrevista
router.put("/:id", async (req, res) => {
    try {
        const entrevistaActualizada = await ProgramaRadial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!entrevistaActualizada) return res.status(404).json({ message: "Entrevista no encontrada" });
        res.json(entrevistaActualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar entrevista", error });
    }
});

// Eliminar una entrevista
router.delete("/:id", async (req, res) => {
    try {
        const entrevistaEliminada = await ProgramaRadial.findByIdAndDelete(req.params.id);
        if (!entrevistaEliminada) return res.status(404).json({ message: "Entrevista no encontrada" });
        res.json({ message: " Entrevista eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar entrevista", error });
    }
});

module.exports = router;
