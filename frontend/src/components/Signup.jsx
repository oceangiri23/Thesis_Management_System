import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Signup.css';

const Signup = () => {
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        // Student fields
        rollno: '',
        semester: '',
        // Common field
        department: '',
        // Supervisor fields
        phone_number: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRoleChange = (e) => {
        setRole(e.target.value);
        // Reset form data except email, username, and password
        setFormData(prev => ({
            email: prev.email,
            username: prev.username,
            password: prev.password,
            confirmPassword: prev.confirmPassword,
            rollno: '',
            semester: '',
            department: '',
            phone_number: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const signupData = {
                email: formData.email,
                username: formData.username,
                password: formData.password,
                role,
                department: formData.department,
                ...(role === 'student' ? {
                    rollno: formData.rollno,
                    semester: parseInt(formData.semester)
                } : {
                    phone_number: formData.phone_number
                })
            };

            await axios.post('http://localhost:5000/api/auth/signup', signupData);
            await login(formData.email, formData.password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Registration</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Register as:</label>
                        <select
                            value={role}
                            onChange={handleRoleChange}
                            className="role-select"
                        >
                            <option value="student">Student</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div>

                    {/* Common Fields */}
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Department:</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="CSE">Computer Science</option>
                            <option value="EEE">Electrical</option>
                            <option value="ME">Mechanical</option>
                            <option value="CE">Civil</option>
                        </select>
                    </div>

                    {/* Student-specific fields */}
                    {role === 'student' && (
                        <>
                            <div className="form-group">
                                <label>Roll Number:</label>
                                <input
                                    type="text"
                                    name="rollno"
                                    value={formData.rollno}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Semester:</label>
                                <input
                                    type="number"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    min="1"
                                    max="8"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {/* Supervisor-specific fields */}
                    {role === 'supervisor' && (
                        <div className="form-group">
                            <label>Phone Number:</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button type="submit">Register</button>
                    <div className="login-link">
                        Already have an account? <Link to="/login">Login here</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup; 