const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
    nombre: String,
    tipoDocumento: String,
    numeroDocumento: String,
    direccion: String,
    municipio: String,
    telefono: String,
    correoElectronico: String,
    registroMercantil: String,
    NIT: String,
    sector: String,
    actividadEconomica: String,
    fechaInicioAsesoria: {
        año: Number,
        semestre: String,
        mes: String
    },
    modalidadAtencion: String,
    responsableAsesoria: String,
    programa: String,
    semestre: String,
    fuenteRemision: String,
    clasificacionSBDC: String,
    clasificacionSuperSociedades: String,
    seguimientoAsesorias: [Number]
}, { collection: 'Empresas' });

module.exports = mongoose.model('Empresa', empresaSchema);