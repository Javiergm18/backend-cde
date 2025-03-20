const express = require("express");
const router = express.Router();
const Evento = require("../models/Evento");

// Crear un evento
router.post("/", async (req, res) => {
    try {
        const nuevoEvento = new Evento(req.body);
        await nuevoEvento.save();
        res.status(201).json(nuevoEvento);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar evento", error });
    }
});

// Obtener todos los eventos
router.get("/", async (req, res) => {
    try {
        const eventos = await Evento.find();
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener eventos", error });
    }
});

module.exports = router;
