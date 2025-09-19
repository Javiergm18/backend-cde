
//eventos es conocido en el frontend como capacitaciones debido a cambios de ultimo momento

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

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==================== Carga masiva con plantilla oficial ====================
router.post('/upload/excel', verificarToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // Leer el Excel
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertir a JSON directamente (usa encabezados de la primera fila)
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (rows.length === 0) {
      return res.status(400).json({ message: 'El archivo Excel está vacío' });
    }

    // Mapear filas al modelo
    const docs = rows.map(r => ({
      entidadOrganizadora: String(r['Entidad organizadora'] || '').trim(),
      fechaEvento: r['Fecha evento'] ? new Date(r['Fecha evento']) : null,
      tipoActividad: String(r['Tipo actividad'] || '').trim(),
      tema: String(r['Tema'] || '').trim(),
      nombreConferencista: String(r['Nombre conferencista'] || '').trim(),
      publicoObjetivo: String(r['Público objetivo'] || '').trim(),
      numeroAsistentes: parseInt(r['Número asistentes'] || '0', 10),
      horaInicio: String(r['Hora inicio'] || '').trim(),
      duracion: parseFloat(r['Duración (horas)'] || '0'),
      modalidad: String(r['Modalidad'] || '').trim(),
      observaciones: String(r['Observaciones'] || '').trim(),
      evidencias: [],
    }));

    // Filtrar filas vacías (ej: cuando no hay fecha ni tema)
    const validDocs = docs.filter(d => d.fechaEvento || d.tema);

    if (validDocs.length === 0) {
      return res.status(400).json({ message: 'No se encontraron filas válidas para insertar' });
    }

    // Guardar en BD
    await EventoCharla.insertMany(validDocs, { ordered: false });

    res.status(201).json({
      message: 'Eventos cargados exitosamente',
      cantidad: validDocs.length
    });

  } catch (err) {
    console.error('Error al procesar Excel:', err);
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
