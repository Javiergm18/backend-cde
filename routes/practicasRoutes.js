const express = require("express");
const router = express.Router();
const Practica = require("../models/Practica");

// Crear una práctica
router.post("/", async (req, res) => {
    try {
        const nuevaPractica = new Practica(req.body);
        await nuevaPractica.save();
        res.status(201).json(nuevaPractica);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar práctica", error });
    }
});

// Obtener todas las prácticas
router.get("/", async (req, res) => {
    try {
        const practicas = await Practica.find();
        res.json(practicas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener prácticas", error });
    }
});

// Obtener una práctica por ID
router.get("/:id", async (req, res) => {
    try {
        const practica = await Practica.findById(req.params.id);
        if (!practica) return res.status(404).json({ message: "Práctica no encontrada" });
        res.json(practica);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar práctica", error });
    }
});

// Actualizar una práctica
router.put("/:id", async (req, res) => {
    try {
        const practicaActualizada = await Practica.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!practicaActualizada) return res.status(404).json({ message: "Práctica no encontrada" });
        res.json(practicaActualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar práctica", error });
    }
});

// Eliminar una práctica
router.delete("/:id", async (req, res) => {
    try {
        const practicaEliminada = await Practica.findByIdAndDelete(req.params.id);
        if (!practicaEliminada) return res.status(404).json({ message: "Práctica no encontrada" });
        res.json({ message: "Práctica eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar práctica", error });
    }
});

module.exports = router;
