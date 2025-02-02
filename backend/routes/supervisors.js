const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const auth = require('../middleware/auth');

router.get('/', auth, supervisorController.getAllSupervisors);

module.exports = router; 