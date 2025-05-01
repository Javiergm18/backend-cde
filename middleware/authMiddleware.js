const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Puedes acceder luego con req.usuario
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
}

module.exports = verificarToken;
