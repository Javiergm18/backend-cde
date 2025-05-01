const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Usuario = require('../models/Usuario'); 

// Crear usuario con contraseña cifrada (sólo para uso interno)
router.post('/', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        const salt = await bcrypt.genSalt(10);
        const contraseñaCifrada = await bcrypt.hash(contraseña, salt);

        const nuevoUsuario = new Usuario({ correo, contraseña: contraseñaCifrada });
        await nuevoUsuario.save();

        res.status(201).json({ message: 'Usuario creado con contraseña cifrada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;
