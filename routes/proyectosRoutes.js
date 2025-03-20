const express = require("express");
const router = express.Router();
const Proyecto = require("../models/Proyecto");

// Obtener todos los proyectos
router.get("/", async (req, res) => {
    try {
        const proyectos = await Proyecto.find();
        res.json(proyectos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener proyectos", error });
    }
});

// Obtener un proyecto por ID
router.get("/:id", async (req, res) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json(proyecto);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar proyecto", error });
    }
});

// Crear un proyecto
router.post("/", async (req, res) => {
    try {
        const nuevoProyecto = new Proyecto(req.body);
        await nuevoProyecto.save();
        res.status(201).json(nuevoProyecto);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar proyecto", error });
    }
});

// Actualizar un proyecto
router.put("/:id", async (req, res) => {
    try {
        const proyectoActualizado = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!proyectoActualizado) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json(proyectoActualizado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar proyecto", error });
    }
});

// Eliminar un proyecto
router.delete("/:id", async (req, res) => {
    try {
        const proyectoEliminado = await Proyecto.findByIdAndDelete(req.params.id);
        if (!proyectoEliminado) return res.status(404).json({ message: "Proyecto no encontrado" });
        res.json({ message: "Proyecto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar proyecto", error });
    }
});

module.exports = router;
