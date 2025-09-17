// backend/routes/gradesRoutes.js
const express = require('express');
const router = express.Router();
const { getAllGrades } = require('../controllers/gradeController');

// Quita el middleware acá:
router.get('/', getAllGrades);

module.exports = router;
