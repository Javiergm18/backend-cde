const express = require('express');
const router = express.Router();
const Emprendedor = require('../models/Emprendedores');
const verificarToken = require('../middleware/authMiddleware');

// Crear un nuevo emprendedor
router.post('/',verificarToken, async (req, res) => {
    const nuevoEmprendedor = new Emprendedor(req.body);
    try {
        await nuevoEmprendedor.save();
        res.status(201).json({ message: 'Emprendedor creado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los emprendedores
router.get('/',verificarToken, async (req, res) => {
    try {
        const emprendedores = await Emprendedor.find();
        res.status(200).json(emprendedores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un emprendedor por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const emprendedor = await Emprendedor.findById(req.params.id);
        if (!emprendedor) return res.status(404).json({ message: 'Emprendedor no encontrado' });
        res.status(200).json(emprendedor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un emprendedor
router.put('/:id',verificarToken, async (req, res) => {
    try {
        const emprendedor = await Emprendedor.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!emprendedor) return res.status(404).json({ message: 'Emprendedor no encontrado' });
        res.status(200).json({ message: 'Emprendedor actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un emprendedor
router.delete('/:id',verificarToken, async (req, res) => {
    try {
        const emprendedor = await Emprendedor.findByIdAndDelete(req.params.id);
        if (!emprendedor) return res.status(404).json({ message: 'Emprendedor no encontrado' });
        res.status(200).json({ message: 'Emprendedor eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buscar emprendedores por nombre
router.get('/buscar/:nombres',verificarToken, async (req, res) => {
    try {
        const emprendedor = await Emprendedor.find({
            nombres: { $regex: req.params.nombres, $options: 'i' }
        });
        res.status(200).json(emprendedor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
