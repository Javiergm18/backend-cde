const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
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
    departamento: String,
    telefono: String,
    correoElectronico: String,
    nombreEmpresa: String,
    registroMercantil: String,
    NIT: String,
    sector: String,
    actividadEconomica: String,
    clasificacionSBDC: String,
    superSociedades: String,
    fechaInicioAsesoria: Date,
    remitido: String,
    areaIntervenir: String,
    brechaCerrar: String,

    evidencias: [
        {
            contenido: String, 
            nombre: String,     
            tipo: String,       
            tamaño: Number      
        }
    ]
}, { collection: 'Empresas' });

module.exports = mongoose.model('Empresa', empresaSchema);
