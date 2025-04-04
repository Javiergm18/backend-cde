const express = require('express');
const router = express.Router();
const EventoCharla = require('../models/EventosCharlas');

// Crear un nuevo evento o charla
router.post('/', async (req, res) => {
    const nuevoEventoCharla = new EventoCharla(req.body);
    try {
        await nuevoEventoCharla.save();
        res.status(201).json({ message: 'Evento o charla creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los eventos y charlas
router.get('/', async (req, res) => {
    try {
        const eventosCharlas = await EventoCharla.find();
        res.status(200).json(eventosCharlas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un evento o charla por ID
router.get('/:id', async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.findById(req.params.id);
        if (!eventoCharla) return res.status(404).json({ message: 'Evento o charla no encontrada' });
        res.status(200).json(eventoCharla);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un evento o charla
router.put('/:id', async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!eventoCharla) return res.status(404).json({ message: 'Evento o charla no encontrada' });
        res.status(200).json({ message: 'Evento o charla actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un evento o charla
router.delete('/:id', async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.findByIdAndDelete(req.params.id);
        if (!eventoCharla) return res.status(404).json({ message: 'Evento o charla no encontrada' });
        res.status(200).json({ message: 'Evento o charla eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
