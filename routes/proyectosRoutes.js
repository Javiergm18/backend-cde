const express = require("express");
const router = express.Router();
const Proyecto = require("../models/Proyecto");

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

// Obtener todos los proyectos
router.get("/", async (req, res) => {
    try {
        const proyectos = await Proyecto.find();
        res.json(proyectos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener proyectos", error });
    }
});

module.exports = router;
