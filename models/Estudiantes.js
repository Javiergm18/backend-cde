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

    fechaNacimiento: Date, // pregunta 3
    estadoCivil: String, // pregunta 6
    ultimoNivelAcademico: String, // pregunta 7
    rolInstitucionEntidad: String, // pregunta 8
    nombreEmprendimiento: String, // pregunta 10
    anoIncioEmprendimiento: String, // pregunta 11
    tipoEmprendimiento: String, // pregunta 12
    productosEmprendimiento: String, // pregunta 13
    motivoEmprendimiento: String, // pregunta 14
    personalEmprendimiento: String, // pregunta 15
    ubicacionEmprendimiento: String, // pregunta 16
    nivelFormalEmprendimiento: String, // pregunta 17
    cursosCapacitaciones: String, // pregunta 18
    retosEmprendimiento: String, // pregunta 19
    canalesDeVenta: String, // pregunta 20
    apoyoEmprendimiento: String, // pregunta 21
    disponibilidadEmprendimiento: String, // pregunta 22
    accesibilidadEmprendimiento: String, // pregunta 23


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
