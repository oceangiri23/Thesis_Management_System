const db = require('../models');
const { Student, StudentGroup } = db;
const bcrypt = require('bcryptjs');

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [{ model: StudentGroup }],
      attributes: { exclude: ['password'] }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentByEmail = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.email, {
      include: [{ model: StudentGroup }],
      attributes: { exclude: ['password'] }
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { email, username, password, rollno, semester, department } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const student = await Student.create({
      email,
      username,
      password: hashedPassword,
      rollno,
      semester,
      department
    });
    
    const { password: _, ...studentData } = student.toJSON();
    res.status(201).json(studentData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { email } = req.params;
    const updates = req.body;
    
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const student = await Student.findByPk(email);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.update(updates);
    const { password: _, ...studentData } = student.toJSON();
    res.json(studentData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.email);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 