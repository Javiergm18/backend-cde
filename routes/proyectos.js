const express = require('express');
const router = express.Router();
const Proyecto = require('../models/Proyecto');
const verificarToken = require('../middleware/authMiddleware');

// Crear un nuevo proyecto o convocatoria
/*
router.post('/',verificarToken, async (req, res) => {
    const nuevoProyecto = new Proyecto(req.body);
    try {
        const proyecto = await nuevoProyecto.save();
        res.status(201).json({ message: 'Proyecto creado exitosamente'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
*/
router.post('/', verificarToken, async (req, res) => {
    try {
        // Procesar evidencias unificadas (imágenes, videos, documentos en base64)
        if (req.body.evidencias && Array.isArray(req.body.evidencias)) {
            req.body.evidencias = req.body.evidencias.map(item => {
                if (item.startsWith('data:')) return item;

                // Por defecto, se asume imagen PNG si no se especifica tipo MIME
                return 'data:image/png;base64,' + item;
            });
        }

        const nuevoProyecto = new Proyecto(req.body);
        await nuevoProyecto.save();
        res.status(201).json({ message: 'Proyecto creado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Obtener todos los proyectos y convocatorias
router.get('/',verificarToken, async (req, res) => {
    try {
        const proyectos = await Proyecto.find();
        res.status(200).json(proyectos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un proyecto o convocatoria por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const proyecto = await Proyecto.findById(req.params.id);
        if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });
        res.status(200).json(proyecto);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/buscar/:nombreProyecto',verificarToken, async (req, res) => {
    try {
        const proyecto = await Proyecto.find({
            nombreProyecto: { $regex: req.params.nombreProyecto, $options: 'i' }
        });
        res.status(200).json(proyecto);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un proyecto o convocatoria
router.put('/:id',verificarToken, async (req, res) => {
    try {
        const proyecto = await Proyecto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado para actualizar' });
        res.status(200).json({ message: 'Proyecto actualizado exitosamente'});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un proyecto o convocatoria
router.delete('/:id',verificarToken, async (req, res) => {
    try {
        const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
        if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado para eliminar' });
        res.status(200).json({ message: 'Proyecto eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
