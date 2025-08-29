const express = require('express');
const router = express.Router();
const Empresa = require('../models/Empresas');
const verificarToken = require('../middleware/authMiddleware');

// Crear una nueva empresa
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

        // Crear la empresa con todos los datos del body
        const nuevaEmpresa = new Empresa(req.body);
        await nuevaEmpresa.save();

        res.status(201).json({ message: 'Empresa creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Obtener todas las empresas
router.get('/',verificarToken, async (req, res) => {
    try {
        const empresas = await Empresa.find();
        res.status(200).json(empresas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buscar emprendedores por nombre
router.get('/buscar/:nombre',verificarToken, async (req, res) => {
    try {
        const empresa = await Empresa.find({
            nombre: { $regex: req.params.nombre, $options: 'i' }
        });
        res.status(200).json(empresa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una empresa por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const empresa = await Empresa.findById(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        res.status(200).json(empresa);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Actualizar una empresa
router.put('/:id', verificarToken, async (req, res) => {
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

        const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });

        res.status(200).json({ message: 'Empresa actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una empresa
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        const empresa = await Empresa.findByIdAndDelete(req.params.id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });
        res.status(200).json({ message: 'Empresa eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar evidencia de una empresa
router.delete('/:id/evidencias/:nombreEvidencia', verificarToken, async (req, res) => {
    try {
        const { id, nombreEvidencia } = req.params;
        const nombreDecodificado = decodeURIComponent(nombreEvidencia);

        const empresa = await Empresa.findById(id);
        if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });

        const evidenciaIndex = empresa.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        empresa.evidencias.splice(evidenciaIndex, 1);
        await empresa.save();

        res.status(200).json({ message: 'Evidencia eliminada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
