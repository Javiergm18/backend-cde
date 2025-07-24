const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
    nombreProyecto: String,
    entidadOrganizadora: String,
    fechaApertura: Date,
    fechaCierre: Date,
    objetivo: String,
    publicoObjetivo: String,
    estado: { type: String, enum: ['Abierta', 'En Evaluación', 'Cerrada', 'En Ejecución'] },
    enlaceInscripcion: String,
    seguimiento: {
        numeroPostulantes: Number,
        beneficiariosSeleccionados: Number
    },
    contactoReferencia: {
        nombre: String,
        correo: String,
        telefono: String
    },
    evidencias: [{
        contenido: String,   // Base64 con prefijo data:...;base64,...
        nombre: String,      // Nombre original del archivo, ej. "foto1.png"
        tipo: String,        // Tipo MIME, ej. "data:image/png"
        tamaño: Number       // Tamaño en bytes (opcional pero útil)
    }],
    generacionDatosEstadisticos: Object // Para análisis y reportes
}, { collection: 'Proyectos' });

module.exports = mongoose.model('Proyecto', proyectoSchema);