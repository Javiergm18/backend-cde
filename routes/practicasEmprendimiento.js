const express = require('express');
const router = express.Router();
const PracticasEmprendimiento = require('../models/PracticasEmprendimiento');
const verificarToken = require('../middleware/authMiddleware');

// Crear una nueva práctica de emprendimiento
router.post('/', verificarToken, async (req, res) => {
    try {
        if (req.body.evidencias && Array.isArray(req.body.evidencias)) {
            req.body.evidencias = req.body.evidencias.map(archivo => {
                let { contenido, nombre, tipo, tamaño } = archivo;

                if (contenido && !contenido.startsWith('data:')) {
                    contenido = `${tipo || 'data:application/octet-stream'};base64,${contenido}`;
                }

                return {
                    contenido: contenido || '',
                    nombre: nombre || 'archivo',
                    tipo: tipo || 'data:application/octet-stream',
                    tamaño: tamaño || 0
                };
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



// Actualizar una práctica de emprendimiento
router.put('/:id', verificarToken, async (req, res) => {
    try {
        // Procesar evidencias si vienen en la petición
        if (req.body.evidencias && Array.isArray(req.body.evidencias)) {
            req.body.evidencias = req.body.evidencias.map(archivo => {
                let { contenido, nombre, tipo, tamaño } = archivo;

                if (contenido && !contenido.startsWith('data:')) {
                    contenido = `${tipo || 'data:application/octet-stream'};base64,${contenido}`;
                }

                return {
                    contenido: contenido || '',
                    nombre: nombre || 'archivo',
                    tipo: tipo || 'data:application/octet-stream',
                    tamaño: tamaño || 0
                };
            });
        }

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

// Eliminar una evidencia específica de una práctica de emprendimiento
router.delete('/:id/evidencias/:nombre', verificarToken, async (req, res) => {
    try {
        const { id, nombre } = req.params;

        // Decodificar el nombre de la evidencia por si contiene espacios o caracteres especiales
        const nombreDecodificado = decodeURIComponent(nombre);

        const practica = await PracticasEmprendimiento.findById(id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });

        const evidenciaIndex = practica.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        // Eliminar la evidencia
        practica.evidencias.splice(evidenciaIndex, 1);
        await practica.save();

        res.status(200).json({ message: 'Evidencia eliminada de la práctica de emprendimiento exitosamente' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
