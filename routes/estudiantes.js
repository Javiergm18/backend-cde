const express = require('express');
const router = express.Router();
const Estudiante = require('../models/Estudiantes');
const verificarToken = require('../middleware/authMiddleware');
const multer = require('multer');
const xlsx = require('xlsx');


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


// ==================== Carga masiva desde Excel - Estudiantes ====================
const storage = multer.memoryStorage();
const upload = multer({ storage });

const parseExcelDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    const d = xlsx.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  if (val instanceof Date && !isNaN(val)) return val;
  const s = String(val).trim();
  const d1 = new Date(s);
  if (!isNaN(d1.getTime())) return d1;
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) {
    let day = parseInt(m[1], 10), month = parseInt(m[2], 10), year = parseInt(m[3], 10);
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

    // Convertir a JSON
    let data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    // Mapeo al modelo Estudiantes
    const docs = data.map(row => ({
      tipoDocumento: row['Tipo Documento']?.toString().trim(),
      numeroDocumento: row['Número Documento']?.toString().trim(),
      nombres: row['Nombres']?.toString().trim(),
      apellidos: row['Apellidos']?.toString().trim(),
      genero: row['Género']?.toString().trim(),
      edad: Number(row['Edad']) || null,
      nivelEducativo: row['Nivel Educativo']?.toString().trim(),
      situacionVulnerabilidad: row['Situación Vulnerabilidad']?.toString().trim(),
      direccion: row['Dirección']?.toString().trim(),
      municipio: row['Municipio']?.toString().trim(),
      departamento: row['Departamento']?.toString().trim(),
      telefono: row['Teléfono']?.toString().trim(),
      correoElectronico: row['Correo Electrónico']?.toString().trim(),
      nombreEmpresa: row['Nombre Empresa']?.toString().trim(),
      sector: row['Sector']?.toString().trim(),
      actividadEconomica: row['Actividad Económica']?.toString().trim(),
      clasificacionSBDC: row['Clasificación SBDC']?.toString().trim(),
      superSociedades: row['SuperSociedades']?.toString().trim(),
      fechaInicioAsesoria: parseExcelDate(row['Fecha Inicio Asesoría']),
      remitido: row['Remitido']?.toString().trim(),
      areaIntervenir: row['Área Intervenir'] ? row['Área Intervenir'].split(',').map(x => x.trim()) : [],
      brechaCerrar: row['Brecha Cerrar'] ? row['Brecha Cerrar'].split(',').map(x => x.trim()) : [],

      evidencias: [],

      semestre: row['Semestre']?.toString().trim(),
      año: Number(row['Año']) || null,
      carrera: row['Carrera']?.toString().trim()
    }));

    await Estudiante.insertMany(docs, { ordered: false });

    res.status(201).json({ message: 'Estudiantes cargados exitosamente', cantidad: docs.length });

  } catch (err) {
    console.error('Error al procesar Excel (Estudiantes):', err);
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
