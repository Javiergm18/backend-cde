const mongoose = require('mongoose');

const emprendedorSchema = new mongoose.Schema({
    tipoDocumento: String,
    numeroDocumento: String,
    nombres: String,
    apellidos: String,
    genero: String,
    edad: Number,
    nivelEducativo: String,
    situacionVulnerabilidad: String,
    direccion: String,
    municipio: String,
    telefono: String,
    correoElectronico: String,
    modalidadAtencion: String,
    responsableAsesoria: String,
    programa: String,
    semestre: String,
    fuenteRemision: String,
    clasificacionSBDC: String,
    clasificacionSuperSociedades: String,
    seguimientoAsesorias: [Number],
    fechaInicioAsesoria: {
        año: Number,
        semestre: String,
        mes: String
    }
}, { collection: 'Emprendedores' });

module.exports = mongoose.model('Emprendedor', emprendedorSchema);