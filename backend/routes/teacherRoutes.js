const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { 
    registerTeacherAndUser,
    getTeacherAssignments,
    getAssignmentData,
    createTask,
    saveDeliveries,
    getAllTeachers,
    getTeacherByCui,
    updateTeacher,
    deactivateTeacher,
    getAssignedTeachers
} = require('../controllers/teacherController');

// --- Rutas específicas primero ---
router.post('/register', authMiddleware, registerTeacherAndUser);
router.get('/assigned', authMiddleware, getAssignedTeachers);
router.get('/assignments/:cui', authMiddleware, getTeacherAssignments);
router.get('/assignment-data/:assignmentId', authMiddleware, getAssignmentData);
router.post('/tasks', authMiddleware, createTask);
router.post('/deliveries', authMiddleware, saveDeliveries);

// --- Rutas generales después ---
router.get('/', authMiddleware, getAllTeachers);
router.put('/deactivate/:cui', authMiddleware, deactivateTeacher);
router.get('/:cui', authMiddleware, getTeacherByCui);
router.put('/:cui', authMiddleware, updateTeacher);

module.exports = router;