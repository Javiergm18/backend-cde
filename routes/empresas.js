const express = require('express');
const router = express.Router();
const Empresa = require('../models/Empresas');

// Crear una nueva empresa
router.post('/', async (req, res) => {
    const nuevaEmpresa = new Empresa(req.body);
    try {
        await nuevaEmpresa.save();
        res.status(201).json({ message: 'Empresa creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todas las empresas
router.get('/', async (req, res) => {
    try {
        const empresas = await Empresa.find();
        res.status(200).json(empresas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una empresa por ID
router.get('/:id', async (req, res) => {
    try {
        const empresa = await Empresa.findById(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        res.status(200).json(empresa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar una empresa
router.put('/:id', async (req, res) => {
    try {
        const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        res.status(200).json({ message: 'Empresa actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una empresa
router.delete('/:id', async (req, res) => {
    try {
        const empresa = await Empresa.findByIdAndDelete(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        res.status(200).json({ message: 'Empresa eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
