const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    registerTeacherAndUser,
    getTeacherAssignments,
    getAssignmentData,
    createTask,
    saveDeliveries
} = require('../controllers/teacherController');

// Ruta para que el Coordinador registre un nuevo docente y su usuario
router.post('/register', authMiddleware, registerTeacherAndUser);

// --- Rutas para el Panel del Docente (se mantienen igual) ---
router.get('/assignments', authMiddleware, getTeacherAssignments);
router.get('/assignment-data/:assignmentId', authMiddleware, getAssignmentData);
router.post('/tasks', authMiddleware, createTask);
router.post('/deliveries', authMiddleware, saveDeliveries);

module.exports = router;

