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

// ==================== Carga masiva desde Excel (robusta) ====================
const storage = multer.memoryStorage();
const upload = multer({ storage });

const normalize = (v) => {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/\r/g, '')
    .replace(/\n/g, ' ')
    .replace(/\u00A0/g, ' ') // nbsp
    .replace(/\./g, '')      // quitar puntos
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

const parseExcelDate = (val) => {
  if (val === null || val === undefined || val === '') return null;

  // Si viene como número (serial Excel)
  if (typeof val === 'number') {
    const d = xlsx.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }

  // Si viene como Date válido
  if (val instanceof Date && !isNaN(val)) return val;

  // Si es string → intentar varios formatos
  const s = String(val).trim().replace(/\./g, '/').replace(/-/g, '/');

  // Intentar parse directo
  const d1 = new Date(s);
  if (!isNaN(d1.getTime())) return d1;

  // Intentar dd/mm/yyyy
  const m = s.match(/(\d{1,2})[\/](\d{1,2})[\/](\d{2,4})/);
  if (m) {
    let day = parseInt(m[1], 10),
        month = parseInt(m[2], 10),
        year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month - 1, day);
  }

  return null;
};

router.post('/upload/excel', verificarToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No se subió ningún archivo' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 1) Leer como matriz para detectar mejor dónde está la fila de encabezados
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const expectedTokens = ['entidad', 'fecha', 'tema', 'charla', 'taller', 'público', 'publico', 'conferencista', 'asistentes', 'hora', 'horas', 'modalidad'];

    let headerRowIndex = -1;
    const maxSearchRows = Math.min(40, rows.length);
    for (let i = 0; i < maxSearchRows; i++) {
      const r = rows[i].map(cell => normalize(cell));
      let matches = 0;
      for (const cell of r) {
        for (const tok of expectedTokens) {
          if (cell.includes(tok)) { matches++; break; }
        }
      }
      if (matches >= 2) { headerRowIndex = i; break; }
    }
    if (headerRowIndex === -1) {
      for (let i = 0; i < maxSearchRows; i++) {
        const r = rows[i].map(cell => normalize(cell));
        if (r.some(c => expectedTokens.some(tok => c.includes(tok)))) { headerRowIndex = i; break; }
      }
    }

    if (headerRowIndex === -1) {
      return res.status(400).json({ message: 'No se pudo detectar la fila de encabezados en el Excel.' });
    }

    const rawHeaders = rows[headerRowIndex].map(h => (h == null ? '' : String(h)));
    const normalizedHeaders = rawHeaders.map(h => normalize(h));
    const normalizedToRaw = {};
    normalizedHeaders.forEach((nh, idx) => {
      if (nh) normalizedToRaw[nh] = rawHeaders[idx];
    });

    console.log('Encabezados originales:', rawHeaders);
    console.log('Encabezados normalizados:', normalizedHeaders);

    const dataRows = xlsx.utils.sheet_to_json(sheet, { defval: '', range: headerRowIndex });
    const rowsArray = Array.isArray(dataRows) ? dataRows : [dataRows];

    console.log('Primeras filas leídas (raw):', rowsArray.slice(0,3));

    const findRawKey = (variants) => {
      for (const v of variants) {
        const vn = v.toLowerCase();
        if (normalizedToRaw[vn]) return normalizedToRaw[vn];
        for (const nh in normalizedToRaw) {
          if (nh.includes(vn)) return normalizedToRaw[nh];
        }
      }
      return null;
    };

    const campoMap = {
      entidadOrganizadora: ['entidad'],
      fechaEvento: ['fecha'],
      tipoActividad: ['charla taller', 'charla', 'taller'],
      tema: ['tema'],
      nombreConferencista: ['conferencista', 'nombre conferencista'],
      publicoObjetivo: ['publico objetivo', 'publico', 'público'],
      numeroAsistentes: ['no asistentes', 'asistentes', 'no asistentes '],
      horaInicio: ['hora'],
      duracion: ['no horas', 'horas', 'duracion'],
      modalidad: ['modalidad']
    };

    const docs = [];
    let lastEntidad = ''; // 🔑 Para arrastrar entidad en celdas combinadas

    for (const rowObj of rowsArray) {
      const getVal = (variants) => {
        const rawKey = findRawKey(variants);
        if (!rawKey) return '';
        return rowObj[rawKey];
      };

      // Fecha
      const fechaRaw = getVal(campoMap.fechaEvento);
      const fecha = parseExcelDate(fechaRaw);

      // Tema
      const temaRaw = getVal(campoMap.tema);
      const temaClean = (temaRaw == null ? '' : String(temaRaw).trim());

      if ((!fecha) && (!temaClean || temaClean.length === 0)) continue;

      // Entidad con arrastre
      const entidadRaw = getVal(campoMap.entidadOrganizadora);
      const entidadClean = entidadRaw && String(entidadRaw).trim() !== ''
        ? String(entidadRaw).trim()
        : lastEntidad;
      if (entidadClean) lastEntidad = entidadClean;

      // Numéricos
      const asistentesRaw = getVal(campoMap.numeroAsistentes);
      const asistentes = parseInt(String(asistentesRaw || '0').replace(/[^\d,.-]/g, '').replace(',', '.'), 10) || 0;

      const durRaw = getVal(campoMap.duracion);
      const dur = parseFloat(String(durRaw || '0').replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;

      const doc = {
        entidadOrganizadora: entidadClean,
        fechaEvento: fecha,
        tipoActividad: String(getVal(campoMap.tipoActividad) || '').trim(),
        tema: temaClean,
        nombreConferencista: String(getVal(campoMap.nombreConferencista) || '').trim(),
        publicoObjetivo: String(getVal(campoMap.publicoObjetivo) || '').trim(),
        numeroAsistentes: asistentes,
        horaInicio: String(getVal(campoMap.horaInicio) || '').trim(),
        duracion: dur,
        modalidad: String(getVal(campoMap.modalidad) || '').trim(),
        observaciones: '',
        evidencias: [],
        generacionDatosEstadisticos: {
          fuente: 'excel',
          hoja: sheetName
        }
      };

      docs.push(doc);
    }

    console.log('Primeros documentos mapeados:', docs.slice(0,5));
    if (docs.length === 0) {
      return res.status(400).json({ message: 'No se encontraron filas válidas para insertar después del mapeo.' });
    }

    await EventoCharla.insertMany(docs, { ordered: false });

    res.status(201).json({ message: 'Eventos cargados exitosamente', cantidad: docs.length });

  } catch (err) {
    console.error('Error al procesar Excel:', err);
    if (err.message && err.message.includes('heap out of memory')) {
      return res.status(500).json({
        message: 'Error: memoria insuficiente al procesar el Excel. Intente archivo más pequeño o iniciar node con más memoria (--max-old-space-size).',
        error: err.message
      });
    }
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
