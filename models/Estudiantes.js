const mongoose = require('mongoose');

const estudianteSchema = new mongoose.Schema({
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
    sector: String,
    actividadEconomica: String,
    clasificacionSBDC: String,
    superSociedades: String,
    fechaInicioAsesoria: Date,   
    remitido: String,
    areaIntervenir: [String],
    brechaCerrar: [String],

    evidencias: [
        {
            contenido: String,  
            nombre: String,     
            tipo: String,      
            tamaño: Number      
        }
    ],


    semestre: String,
    año: Number,
    carrera: String
}, { collection: 'Estudiantes' });

module.exports = mongoose.model('Estudiante', estudianteSchema);
