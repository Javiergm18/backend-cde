const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Usuario = require('./models/Usuario'); 

dotenv.config(); 

async function cambiarPassword() {
  try {
    // === CONFIGURACIÓN DEL USUARIO A CAMBIAR ===
    const correo = 'emprendimiento@upb.edu.co'; // usuario existente
    const nuevaPassword = 'Profesional/2025*'; // nueva contraseña 

    // === CONECTAR A MONGODB ===
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB ✅');

    // === ENCRIPTAR CONTRASEÑA ===
    const hashed = await bcrypt.hash(nuevaPassword, 10);

    // === ACTUALIZAR DOCUMENTO ===
    const resultado = await Usuario.updateOne(
      { correo: correo },
      { $set: { contraseña: hashed } }
    );

    if (resultado.matchedCount > 0) {
      console.log(`Contraseña actualizada correctamente para ${correo}`);
    } else {
      console.log(`No se encontró ningún usuario con el correo ${correo}`);
    }

  } catch (err) {
    console.error('Error al cambiar la contraseña', err);
  } finally {
    await mongoose.connection.close();
  }
}

cambiarPassword();
