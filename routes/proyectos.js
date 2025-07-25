const express = require('express');
const router = express.Router();
const Proyecto = require('../models/Proyecto');
const verificarToken = require('../middleware/authMiddleware');

// Crear un nuevo proyecto o convocatoria
router.post('/', verificarToken, async (req, res) => {
    try {
        // Procesar evidencias unificadas (base64 + metadata)
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

// Eliminar una evidencia específica de un proyecto o convocatoria
router.delete('/:id/evidencias/:nombre', verificarToken, async (req, res) => {
    try {
        const { id, nombre } = req.params;
        const nombreDecodificado = decodeURIComponent(nombre);

        const proyecto = await Proyecto.findById(id);
        if (!proyecto) return res.status(404).json({ message: 'Proyecto no encontrado' });

        const evidenciaIndex = proyecto.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        proyecto.evidencias.splice(evidenciaIndex, 1);
        await proyecto.save();

        res.status(200).json({ message: 'Evidencia eliminada del proyecto exitosamente' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
