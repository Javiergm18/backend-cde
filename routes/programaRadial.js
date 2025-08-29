const express = require('express');
const router = express.Router();
const ProgramaRadial = require('../models/ProgramaRadial');
const verificarToken = require('../middleware/authMiddleware');

// Crear una nueva entrevista en el programa radial
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

        const nuevaEntrevista = new ProgramaRadial(req.body);
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



// Actualizar una entrevista del programa radial
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

// Eliminar una evidencia específica de una entrevista radial
router.delete('/:id/evidencias/:nombre', verificarToken, async (req, res) => {
    try {
        const { id, nombre } = req.params;
        const nombreDecodificado = decodeURIComponent(nombre);

        const entrevista = await ProgramaRadial.findById(id);
        if (!entrevista) return res.status(404).json({ message: 'Entrevista no encontrada' });

        const evidenciaIndex = entrevista.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        // Eliminar la evidencia
        entrevista.evidencias.splice(evidenciaIndex, 1);
        await entrevista.save();

        res.status(200).json({ message: 'Evidencia eliminada de la entrevista radial exitosamente' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
