const mongoose = require('mongoose');

const emprendedorSchema = new mongoose.Schema({
    tipoDocumento: String, //pregunta 1
    numeroDocumento: String, // pregunta 2
    nombres: String, 
    apellidos: String,
    genero: String,
    edad: Number, // pregunta 4
    nivelEducativo: String, // pregunta 7
    situacionVulnerabilidad: String,
    direccion: String, // pregunta 5 
    municipio: String,
    departamento: String,
    telefono: String,
    correoElectronico: String,
    nombreEmpresa: String, // pregunta 10
    sector: String, // pregunta 12
    actividadEconomica: String,  // pregunta 13
    clasificacionSBDC: String,
    superSociedades: String,
    fechaInicioAsesoria: Date,   
    remitido: String,

    fechaNacimiento: Date, // pregunta 3
    estadoCivil: String, // pregunta 6
    rolInstitucionEntidad: String, // pregunta 8
        // si es estudiante
    semestre: String, //pregunta 9
    año: Number,
    carrera: String,

    anoIncioEmprendimiento: String, // pregunta 11
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
    ]
    


}, { collection: 'Emprendedores' });

module.exports = mongoose.model('Emprendedor', emprendedorSchema);
