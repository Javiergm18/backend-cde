const express = require('express');
const router = express.Router();
const PracticasEmprendimiento = require('../models/PracticasEmprendimiento');
const verificarToken = require('../middleware/authMiddleware');

// Crear una nueva práctica de emprendimiento
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

        const nuevaPractica = new PracticasEmprendimiento(req.body);
        await nuevaPractica.save();
        res.status(201).json({ message: 'Práctica de emprendimiento creada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// ==================== Carga masiva desde Excel - Emprendedores ====================
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Reutilizamos el parser de fechas
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

    // Mapeo al modelo Emprendedor
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
      areaIntervenir: row['Área a Intervenir'] 
        ? row['Área a Intervenir'].split(',').map(v => v.trim()) 
        : [],
      brechaCerrar: row['Brecha a Cerrar'] 
        ? row['Brecha a Cerrar'].split(',').map(v => v.trim()) 
        : [],
      evidencias: [],
    }));

    await Emprendedor.insertMany(docs, { ordered: false });

    res.status(201).json({ message: 'Emprendedores cargados exitosamente', cantidad: docs.length });

  } catch (err) {
    console.error('Error al procesar Excel (Emprendedores):', err);
    res.status(500).json({ message: err.message });
  }
});






// Obtener todas las prácticas de emprendimiento
router.get('/',verificarToken, async (req, res) => {
    try {
        const practicas = await PracticasEmprendimiento.find();
        res.status(200).json(practicas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/buscar/:nombreEstudiante',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.find({
            nombreEstudiante: { $regex: req.params.nombreEstudiante, $options: 'i' }
        });
        res.status(200).json(practica);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener una práctica de emprendimiento por ID
router.get('/:id',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findById(req.params.id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json(practica);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



// Actualizar una práctica de emprendimiento
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

        const practica = await PracticasEmprendimiento.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });

        res.status(200).json({ message: 'Práctica de emprendimiento actualizada exitosamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Eliminar una práctica de emprendimiento
router.delete('/:id',verificarToken, async (req, res) => {
    try {
        const practica = await PracticasEmprendimiento.findByIdAndDelete(req.params.id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });
        res.status(200).json({ message: 'Práctica de emprendimiento eliminada' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar una evidencia específica de una práctica de emprendimiento
router.delete('/:id/evidencias/:nombre', verificarToken, async (req, res) => {
    try {
        const { id, nombre } = req.params;

        // Decodificar el nombre de la evidencia por si contiene espacios o caracteres especiales
        const nombreDecodificado = decodeURIComponent(nombre);

        const practica = await PracticasEmprendimiento.findById(id);
        if (!practica) return res.status(404).json({ message: 'Práctica no encontrada' });

        const evidenciaIndex = practica.evidencias.findIndex(e => e.nombre === nombreDecodificado);
        if (evidenciaIndex === -1) {
            return res.status(404).json({ message: 'Evidencia no encontrada' });
        }

        // Eliminar la evidencia
        practica.evidencias.splice(evidenciaIndex, 1);
        await practica.save();

        res.status(200).json({ message: 'Evidencia eliminada de la práctica de emprendimiento exitosamente' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
