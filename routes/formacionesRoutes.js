const express = require("express");
const router = express.Router();
const Formacion = require("../models/Formacion");

// Obtener todas las formaciones
router.get("/", async (req, res) => {
    try {
        const formaciones = await Formacion.find();
        res.json(formaciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener formaciones", error });
    }
});

// Obtener una formación por ID
router.get("/:id", async (req, res) => {
    try {
        const formacion = await Formacion.findById(req.params.id);
        if (!formacion) return res.status(404).json({ message: "Formación no encontrada" });
        res.json(formacion);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar formación", error });
    }
});

// Crear una formación
router.post("/", async (req, res) => {
    try {
        const nuevaFormacion = new Formacion(req.body);
        await nuevaFormacion.save();
        res.status(201).json(nuevaFormacion);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar formación", error });
    }
});

// Actualizar una formación
router.put("/:id", async (req, res) => {
    try {
        const formacionActualizada = await Formacion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!formacionActualizada) return res.status(404).json({ message: "Formación no encontrada" });
        res.json(formacionActualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar formación", error });
    }
});

// Eliminar una formación
router.delete("/:id", async (req, res) => {
    try {
        const formacionEliminada = await Formacion.findByIdAndDelete(req.params.id);
        if (!formacionEliminada) return res.status(404).json({ message: "Formación no encontrada" });
        res.json({ message: " Formación eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar formación", error });
    }
});

module.exports = router;
