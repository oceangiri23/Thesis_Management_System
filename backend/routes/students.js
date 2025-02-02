const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

router.get('/', auth, studentController.getAllStudents);
router.get('/:email', auth, studentController.getStudentByEmail);
router.post('/', studentController.createStudent);
router.put('/:email', auth, studentController.updateStudent);
router.delete('/:email', auth, studentController.deleteStudent);

module.exports = router; 