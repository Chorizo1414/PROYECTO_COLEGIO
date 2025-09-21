// en backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendPaymentReminder } = require('../controllers/notificationController');

router.post('/payment-reminder', authMiddleware, sendPaymentReminder);

module.exports = router;