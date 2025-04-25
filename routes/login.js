const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// Ruta para login
router.post('/', async (req, res) => {
    const { correo, contraseña } = req.body;

    try {
        const usuario = await Usuario.findOne({ correo });

        if (!usuario || usuario.contraseña !== contraseña) {
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }

        // En una app real aquí generarías un token JWT
        res.status(200).json({ message: 'Inicio de sesión exitoso' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;