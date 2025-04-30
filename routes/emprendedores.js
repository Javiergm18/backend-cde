const express = require('express');
const router = express.Router();
const Emprendedor = require('../models/Emprendedores');

// Crear un nuevo emprendedor
router.post('/', async (req, res) => {
    const nuevoEmprendedor = new Emprendedor(req.body);
    try {
        await nuevoEmprendedor.save();
        res.status(201).json({ message: 'Emprendedor creado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los emprendedores
router.get('/', async (req, res) => {
    try {
        const emprendedores = await Emprendedor.find();
        res.status(200).json(emprendedores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un emprendedor por ID
router.get('/:id', async (req, res) => {
    try {
        const emprendedor = await Emprendedor.findById(req.params.id);
        if (!emprendedor) return res.status(404).json({ message: 'Emprendedor no encontrado' });
        res.status(200).json(emprendedor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un emprendedor
router.put('/:id', async (req, res) => {
    try {
        const emprendedor = await Emprendedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!emprendedor) return res.status(404).json({ message: 'Emprendedor no encontrado' });
        res.status(200).json({ message: 'Emprendedor actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un emprendedor
router.delete('/:id', async (req, res) => {
    try {
        const emprendedor = await Emprendedor.findByIdAndDelete(req.params.id);
        if (!emprendedor) return res.status(404).json({ message: 'Emprendedor no encontrado' });
        res.status(200).json({ message: 'Emprendedor eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/buscar/:nombres', async (req, res) => {
    try {
        const nombres = req.params.nombre;
        const emprendedores = await Emprendedor.find({
            nombres: { $regex: new RegExp(nombres, 'i') }
        });
        res.status(200).json(emprendedores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
