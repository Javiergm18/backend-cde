const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Conectado a MongoDB"))
.catch(err => console.error(" Error al conectar a MongoDB:", err));

// Importar rutas
const eventosRoutes = require("./routes/eventosRoutes");
const formacionesRoutes = require("./routes/formacionesRoutes");
const practicasRoutes = require("./routes/practicasRoutes");
const programaRadialRoutes = require("./routes/programaRadialRoutes");
const proyectosRoutes = require("./routes/proyectosRoutes");

// Registrar rutas
app.use("/api/eventos", eventosRoutes);
app.use("/api/formaciones", formacionesRoutes);
app.use("/api/practicas", practicasRoutes);
app.use("/api/programa_radial", programaRadialRoutes);
app.use("/api/proyectos", proyectosRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
    res.send(" API funcionando correctamente");
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Servidor corriendo en puerto ${PORT}`));
