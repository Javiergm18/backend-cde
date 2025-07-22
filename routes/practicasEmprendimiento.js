const express = require('express');
const router = express.Router();
const PracticasEmprendimiento = require('../models/PracticasEmprendimiento');
const verificarToken = require('../middleware/authMiddleware');

// Crear una nueva práctica de emprendimiento
/*
router.post('/',verificarToken, async (req, res) => {
    const nuevaPractica = new PracticasEmprendimiento(req.body);
    try {
        await nuevaPractica.save();
        res.status(201).json({ message: 'Práctica de emprendimiento creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
*/
router.post('/', verificarToken, async (req, res) => {
    try {
        // Procesar evidencias fotográficas (imagen/video en base64)
        if (req.body.evidenciasFotograficas && Array.isArray(req.body.evidenciasFotograficas)) {
            req.body.evidenciasFotograficas = req.body.evidenciasFotograficas.map(item => {
                return item.startsWith('data:image') || item.startsWith('data:video')
                    ? item
                    : 'data:image/png;base64,' + item;
            });
        }

        // Procesar evidencias documentales (PDF, DOC, etc.)
        if (req.body.evidenciasDocumentos && Array.isArray(req.body.evidenciasDocumentos)) {
            req.body.evidenciasDocumentos = req.body.evidenciasDocumentos.map(item => {
                return item.startsWith('data:application')
                    ? item
                    : 'data:application/pdf;base64,' + item;
            });
        }

        const nuevaPractica = new PracticasEmprendimiento(req.body);
        await nuevaPractica.save();
        res.status(201).json({ message: 'Práctica de emprendimiento creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Obtener todas las prácticas de emprendimiento
router.get('/',verificarToken, async (req, res) => {
    try {
        const practicas = await PracticasEmprendimiento.find();
        res.status(200).json(practicas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una práctica de emprendimiento por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findById(req.params.id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json(practica);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/buscar/:nombreEstudiante',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.find({
            nombreEstudiante: { $regex: req.params.nombreEstudiante, $options: 'i' }
        });
        res.status(200).json(practica);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar una práctica de emprendimiento
router.put('/:id',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json({ message: 'Práctica de emprendimiento actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una práctica de emprendimiento
router.delete('/:id',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findByIdAndDelete(req.params.id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json({ message: 'Práctica de emprendimiento eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
