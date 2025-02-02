const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { Student, Supervisor, Admin } = db;

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        let user;

        switch (role) {
            case 'student':
                user = await Student.findByPk(email);
                break;
            case 'supervisor':
                user = await Supervisor.findByPk(email);
                break;
            case 'admin':
                user = await Admin.findByPk(email);
                break;
            default:
                return res.status(400).json({ message: 'Invalid role' });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(password, user.password);
        const isMatch = password.toString() === user.password.toString();
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userData } = user.toJSON();

        res.json({
            message: 'Login successful',
            token,
            user: userData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.signup = async (req, res) => {
    try {
        const { email, username, password, role, ...otherData } = req.body;

        // Check if user already exists
        let existingUser;
        if (role === 'student') {
            existingUser = await Student.findByPk(email);
        } else if (role === 'supervisor') {
            existingUser = await Supervisor.findByPk(email);
        }

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        let user;
        if (role === 'student') {
            user = await Student.create({
                email,
                username,
                password,
                role,
                rollno: otherData.rollno,
                semester: otherData.semester,
                department: otherData.department
            });
        } else if (role === 'supervisor') {
            user = await Supervisor.create({
                email,
                username,
                password,
                role,
                phone_number: otherData.phone_number,
                department: otherData.department,
                no_of_group_supervised: 0
            });
        }

        const token = jwt.sign(
            { id: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Remove password from response
        const { password: _, ...userData } = user.toJSON();

        res.status(201).json({
            message: `${role} registered successfully`,
            token,
            user: userData
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: error.message });
    }
}; 