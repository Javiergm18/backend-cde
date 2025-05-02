const express = require('express');
const router = express.Router();
const ProgramaRadial = require('../models/ProgramaRadial');
const verificarToken = require('../middleware/authMiddleware');

// Crear una nueva entrevista en el programa radial
router.post('/',verificarToken, async (req, res) => {
    const nuevaEntrevista = new ProgramaRadial(req.body);
    try {
        await nuevaEntrevista.save();
        res.status(201).json({ message: 'Entrevista creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todas las entrevistas del programa radial
router.get('/',verificarToken, async (req, res) => {
    try {
        const entrevistas = await ProgramaRadial.find();
        res.status(200).json(entrevistas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una entrevista del programa radial por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const entrevista = await ProgramaRadial.findById(req.params.id);
        if (!entrevista) return res.status(404).json({ message: 'Entrevista no encontrada' });
        res.status(200).json(entrevista);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/buscar/:nombreEntrevistado',verificarToken, async (req, res) => {
    try {
        const entrevista = await ProgramaRadial.find({
            nombreEntrevistado: { $regex: req.params.nombreEntrevistado, $options: 'i' }
        });
        res.status(200).json(entrevista);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar una entrevista del programa radial
router.put('/:id',verificarToken, async (req, res) => {
    try {
        const entrevista = await ProgramaRadial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!entrevista) return res.status(404).json({ message: 'Entrevista no encontrada' });
        res.status(200).json({ message: 'Entrevista actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una entrevista del programa radial
router.delete('/:id',verificarToken, async (req, res) => {
    try {
        const entrevista = await ProgramaRadial.findByIdAndDelete(req.params.id);
        if (!entrevista) return res.status(404).json({ message: 'Entrevista no encontrada' });
        res.status(200).json({ message: 'Entrevista eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
