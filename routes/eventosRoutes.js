const express = require("express");
const router = express.Router();
const Evento = require("../models/Evento");

// Ruta de prueba
router.get("/test", (req, res) => {
    res.send(" Ruta de eventos funcionando");
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

// Obtener un evento por ID
router.get("/:id", async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) return res.status(404).json({ message: "Evento no encontrado" });
        res.json(evento);
    } catch (error) {
        res.status(500).json({ message: "Error al buscar evento", error });
    }
});

// Crear un nuevo evento
router.post("/", async (req, res) => {
    try {
        const nuevoEvento = new Evento(req.body);
        await nuevoEvento.save();
        res.status(201).json(nuevoEvento);
    } catch (error) {
        res.status(500).json({ message: "Error al registrar evento", error });
    }
});

// Actualizar un evento por ID
router.put("/:id", async (req, res) => {
    try {
        const eventoActualizado = await Evento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!eventoActualizado) return res.status(404).json({ message: "Evento no encontrado" });
        res.json(eventoActualizado);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar evento", error });
    }
});

// Eliminar un evento por ID
router.delete("/:id", async (req, res) => {
    try {
        const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
        if (!eventoEliminado) return res.status(404).json({ message: "Evento no encontrado" });
        res.json({ message: " Evento eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar evento", error });
    }
});

module.exports = router;
