const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



// Ruta para login
router.post('/', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Comparar la contraseña ingresada con la cifrada en la base de datos
        const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
        if (!contraseñaValida) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // Si la contraseña es válida, generamos el token JWT
        const token = jwt.sign({ id: usuario._id, correo: usuario.correo }, JWT_SECRET, {
            expiresIn: '1h' // el token expira en 1 hora
        });

        res.status(200).json({ message: 'Inicio de sesión exitoso', token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
