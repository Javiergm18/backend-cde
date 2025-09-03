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

router.post('/upload/excel', verificarToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }

        // Leer archivo Excel desde buffer
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; // Primera hoja
        const worksheet = workbook.Sheets[sheetName];

        // Convertir hoja a JSON
        const data = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

        // Mapear filas a la estructura del modelo
        const eventos = data.map(row => ({
            entidadOrganizadora: row["Entidad Organizadora"] || "",
            fechaEvento: row["Fecha Evento"] ? new Date(row["Fecha Evento"]) : null,
            tipoActividad: row["Tipo Actividad"] || "",
            tema: row["Tema"] || "",
            nombreConferencista: row["Nombre Conferencista"] || "",
            publicoObjetivo: row["Público Objetivo"] || "",
            numeroAsistentes: row["Número Asistentes"] ? Number(row["Número Asistentes"]) : 0,
            horaInicio: row["Hora Inicio"] || "",
            duracion: row["Duración (horas)"] ? Number(row["Duración (horas)"]) : 0,
            modalidad: row["Modalidad"] || "",
            observaciones: row["Observaciones"] || "",
            evidencias: [],
            generacionDatosEstadisticos: {}
        }));

        // Insertar en MongoDB
        await EventoCharla.insertMany(eventos);

        res.status(200).json({
            message: "Eventos cargados exitosamente",
            total: eventos.length
        });

    } catch (error) {
        console.error("Error al procesar el archivo:", error);
        res.status(500).json({ message: "Error al procesar el archivo", error });
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
