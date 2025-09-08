const express = require('express');
const router = express.Router();
const EventoCharla = require('../models/EventosCharlas');
const verificarToken = require('../middleware/authMiddleware');
const multer = require('multer');
const xlsx = require('xlsx');

// Crear un nuevo evento o charla

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

        const nuevoEventoCharla = new EventoCharla(req.body);
        await nuevoEventoCharla.save();
        res.status(201).json({ message: 'Evento o charla creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== Carga masiva desde Excel ====================
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-excel', verificarToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        // Leer el archivo Excel desde el buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Solo la primera hoja
        const sheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        let data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

        // Mapeo a nuestro modelo
        data = data.map(row => ({
            entidadOrganizadora: row['Entidad']?.toString().trim() || '',
            fechaEvento: row['Fecha'] ? new Date(row['Fecha']) : null,
            tipoActividad: row['Charla Taller'] || row['Charla\nTaller'] || '',
            tema: row['Tema']?.toString().trim() || '',
            nombreConferencista: row['Conferencista']?.toString().trim() || '',
            publicoObjetivo: row['Público']?.toString().trim() || '',
            numeroAsistentes: parseInt(row['No. Asistentes ']?.toString().trim() || '0', 10),
            horaInicio: row['Hora']?.toString().trim() || '',
            duracion: parseFloat(row['No. Horas']?.toString().trim() || '0'),
            modalidad: row['Modalidad']?.toString().trim() || '',
            observaciones: '',
            evidencias: []
        }));

        // Insertar todos en MongoDB
        await EventoCharla.insertMany(data);

        res.status(201).json({ message: 'Eventos cargados exitosamente', cantidad: data.length });
    } catch (err) {
        console.error('Error al procesar Excel:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


// Obtener todos los eventos y charlas
router.get('/',verificarToken, async (req, res) => {
    try {
        const eventosCharlas = await EventoCharla.find();
        res.status(200).json(eventosCharlas);
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




// Actualizar un evento o charla
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

router.delete('/:id/evidencias/:nombreEvidencia', verificarToken, async (req, res) => {
    try {
        const { id, nombreEvidencia } = req.params;

        // Decodificar el nombre por si viene con caracteres especiales
        const nombreDecodificado = decodeURIComponent(nombreEvidencia);

        const evento = await EventoCharla.findById(id);
        if (!evento) return res.status(404).json({ message: 'Evento o charla no encontrada' });

        const evidenciaIndex = evento.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        // Eliminar la evidencia
        evento.evidencias.splice(evidenciaIndex, 1);
        await evento.save();

        res.status(200).json({ message: 'Evidencia eliminada exitosamente' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
