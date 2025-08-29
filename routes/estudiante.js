const express = require('express');
const router = express.Router();
const Estudiante = require('../models/Estudiantes');
const verificarToken = require('../middleware/authMiddleware');

// Crear un nuevo estudiante
router.post('/', verificarToken, async (req, res) => {
    try {
        // Procesar evidencias (imagen, video, documento) con nombre, tipo, contenido y tamaño
        if (req.body.evidencias && Array.isArray(req.body.evidencias)) {
            req.body.evidencias = req.body.evidencias.map(archivo => {
                let { contenido, nombre, tipo, tamaño } = archivo;

                // Agrega el prefijo si no está presente
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

        // Crear el estudiante con todos los datos del body
        const nuevoEstudiante = new Estudiante(req.body);
        await nuevoEstudiante.save();

        res.status(201).json({ message: 'Estudiante creado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Obtener todos los estudiantes
router.get('/', verificarToken, async (req, res) => {
    try {
        const estudiantes = await Estudiante.find();
        res.status(200).json(estudiantes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buscar estudiantes por nombre
router.get('/buscar/:nombres', verificarToken, async (req, res) => {
    try {
        const estudiantes = await Estudiante.find({
            nombres: { $regex: req.params.nombres, $options: 'i' }
        });
        res.status(200).json(estudiantes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Obtener un estudiante por ID
router.get('/:id', verificarToken, async (req, res) => {
    try {
        const estudiante = await Estudiante.findById(req.params.id);
        if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
        res.status(200).json(estudiante);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Actualizar un estudiante
router.put('/:id', verificarToken, async (req, res) => {
    try {
        // Procesar evidencias antes de actualizar
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

        const estudiante = await Estudiante.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

        res.status(200).json({ message: 'Estudiante actualizado exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un estudiante
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const estudiante = await Estudiante.findByIdAndDelete(req.params.id);
        if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });
        res.status(200).json({ message: 'Estudiante eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar evidencia de un estudiante
router.delete('/:id/evidencias/:nombreEvidencia', verificarToken, async (req, res) => {
    try {
        const { id, nombreEvidencia } = req.params;
        const nombreDecodificado = decodeURIComponent(nombreEvidencia);

        const estudiante = await Estudiante.findById(id);
        if (!estudiante) return res.status(404).json({ message: 'Estudiante no encontrado' });

        const evidenciaIndex = estudiante.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        estudiante.evidencias.splice(evidenciaIndex, 1);
        await estudiante.save();

        res.status(200).json({ message: 'Evidencia eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
