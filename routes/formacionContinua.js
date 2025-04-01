const express = require('express');
const router = express.Router();
const FormacionContinua = require('../models/FormacionContinua');

// Crear un nuevo curso, seminario o taller
router.post('/', async (req, res) => {
    const nuevoCurso = new FormacionContinua(req.body);
    try {
        await nuevoCurso.save();
        res.status(201).json({ message: 'Curso creado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los cursos, seminarios o talleres
router.get('/', async (req, res) => {
    try {
        const cursos = await FormacionContinua.find();
        res.status(200).json(cursos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un curso, seminario o taller por ID
router.get('/:id', async (req, res) => {
    try {
        const curso = await FormacionContinua.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
        res.status(200).json(curso);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un curso, seminario o taller
router.put('/:id', async (req, res) => {
    try {
        const curso = await FormacionContinua.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
        res.status(200).json({ message: 'Curso actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un curso, seminario o taller
router.delete('/:id', async (req, res) => {
    try {
        const curso = await FormacionContinua.findByIdAndDelete(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
        res.status(200).json({ message: 'Curso eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
