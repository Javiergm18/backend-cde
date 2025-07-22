const express = require('express');
const router = express.Router();
const EventoCharla = require('../models/EventosCharlas');
const verificarToken = require('../middleware/authMiddleware');

// Crear un nuevo evento o charla
/*
router.post('/', verificarToken, async (req, res) => {
    try {
        // Prefijar base64 si no lo tiene
        
        if (req.body.evidenciasFotograficas && Array.isArray(req.body.evidenciasFotograficas)) {
            req.body.evidenciasFotograficas = req.body.evidenciasFotograficas.map(media => {
                // Asegura que sea un objeto con los campos esperados
                let { nombre, tipo, contenido, esVideo } = media;

                // Agrega el prefijo si no está presente
                if (!contenido.startsWith('data:')) {
                    contenido = `${tipo};base64,${contenido}`;
                }

                return {
                    nombre: nombre || 'archivo',
                    tipo: tipo || 'data:image/png',
                    contenido,
                    esVideo: esVideo || 'false'
                };
            });
        }

        const nuevoEventoCharla = new EventoCharla(req.body);
        await nuevoEventoCharla.save();
        res.status(201).json({ message: 'Evento o charla creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
*/

router.post('/', verificarToken, async (req, res) => {
    try {
        if (req.body.evidencias && Array.isArray(req.body.evidencias)) {
            req.body.evidencias = req.body.evidencias.map(item => {
                // Si ya tiene prefijo, lo dejamos
                if (item.startsWith('data:')) return item;

                // Por defecto, lo tratamos como imagen PNG
                return 'data:image/png;base64,' + item;
            });
        }

        const nuevoEventoCharla = new EventoCharla(req.body);
        await nuevoEventoCharla.save();
        res.status(201).json({ message: 'Evento o charla creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Obtener todos los eventos y charlas
router.get('/',verificarToken, async (req, res) => {
    try {
        const eventosCharlas = await EventoCharla.find();
        res.status(200).json(eventosCharlas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener un evento o charla por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.findById(req.params.id);
        if (!eventoCharla) return res.status(404).json({ message: 'Evento o charla no encontrada' });
        res.status(200).json(eventoCharla);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Buscar emprendedores por tema
router.get('/buscar/:tema',verificarToken, async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.find({
            tema: { $regex: req.params.tema, $options: 'i' }
        });
        res.status(200).json(eventoCharla);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Actualizar un evento o charla
router.put('/:id',verificarToken, async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!eventoCharla) return res.status(404).json({ message: 'Evento o charla no encontrada' });
        res.status(200).json({ message: 'Evento o charla actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un evento o charla
router.delete('/:id',verificarToken, async (req, res) => {
    try {
        const eventoCharla = await EventoCharla.findByIdAndDelete(req.params.id);
        if (!eventoCharla) return res.status(404).json({ message: 'Evento o charla no encontrada' });
        res.status(200).json({ message: 'Evento o charla eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
