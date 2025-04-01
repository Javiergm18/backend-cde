const express = require('express');
const router = express.Router();
const PracticasEmprendimiento = require('../models/PracticasEmprendimiento');

// Crear una nueva práctica de emprendimiento
router.post('/', async (req, res) => {
    const nuevaPractica = new PracticasEmprendimiento(req.body);
    try {
        await nuevaPractica.save();
        res.status(201).json({ message: 'Práctica de emprendimiento creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todas las prácticas de emprendimiento
router.get('/', async (req, res) => {
    try {
        const practicas = await PracticasEmprendimiento.find();
        res.status(200).json(practicas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una práctica de emprendimiento por ID
router.get('/:id', async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findById(req.params.id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json(practica);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar una práctica de emprendimiento
router.put('/:id', async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json({ message: 'Práctica de emprendimiento actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una práctica de emprendimiento
router.delete('/:id', async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findByIdAndDelete(req.params.id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json({ message: 'Práctica de emprendimiento eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
