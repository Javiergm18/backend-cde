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


// ==================== Carga masiva desde Excel - Empresas ====================
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

    let data = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    const docs = data.map(row => ({
      tipoDocumento: row['Tipo Documento']?.toString().trim(),
      numeroDocumento: row['Número Documento']?.toString().trim(),
      nombres: row['Nombres']?.toString().trim(),
      apellidos: row['Apellidos']?.toString().trim(),
      genero: row['Género']?.toString().trim(),
      edad: parseInt(row['Edad'] || 0, 10),
      nivelEducativo: row['Nivel Educativo']?.toString().trim(),
      situacionVulnerabilidad: row['Situación Vulnerabilidad']?.toString().trim(),
      direccion: row['Dirección']?.toString().trim(),
      municipio: row['Municipio']?.toString().trim(),
      departamento: row['Departamento']?.toString().trim(),
      telefono: row['Teléfono']?.toString().trim(),
      correoElectronico: row['Correo Electrónico']?.toString().trim(),
      nombreEmpresa: row['Nombre Empresa']?.toString().trim(),
      registroMercantil: row['Registro Mercantil']?.toString().trim(),
      NIT: row['NIT']?.toString().trim(),
      sector: row['Sector']?.toString().trim(),
      actividadEconomica: row['Actividad Económica']?.toString().trim(),
      clasificacionSBDC: row['Clasificación SBDC']?.toString().trim(),
      superSociedades: row['SuperSociedades']?.toString().trim(),
      fechaInicioAsesoria: parseExcelDate(row['Fecha Inicio Asesoría']),
      remitido: row['Remitido']?.toString().trim(),
      areaIntervenir: row['Área Intervenir'] ? row['Área Intervenir'].split(',').map(x => x.trim()) : [],
      brechaCerrar: row['Brecha Cerrar'] ? row['Brecha Cerrar'].split(',').map(x => x.trim()) : [],
      evidencias: [],
      generacionDatosEstadisticos: {
        fuente: 'excel',
        hoja: sheetName
      }
    }));

    await Empresa.insertMany(docs, { ordered: false });

    res.status(201).json({ message: 'Empresas cargadas exitosamente', cantidad: docs.length });

  } catch (err) {
    console.error('Error al procesar Excel:', err);
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
