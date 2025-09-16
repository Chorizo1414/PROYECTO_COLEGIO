const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createParent, getAllParents } = require('../controllers/parentController');

// POST /api/parents -> Crear un padre/encargado (ruta protegida)
router.post('/', authMiddleware, createParent);

// GET /api/parents -> Obtener todos los padres (ruta protegida)
router.get('/', authMiddleware, getAllParents);

module.exports = router;