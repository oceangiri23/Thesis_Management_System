import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddMemberModal.css';

const AddMemberModal = ({ groupId, onClose, onMemberAdded }) => {
    const [availableStudents, setAvailableStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailableStudents();
    }, [groupId]);

    const fetchAvailableStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/groups/${groupId}/available-students`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setAvailableStudents(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch available students');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedStudent) {
            setError('Please select a student');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/groups/${groupId}/members`,
                { studentEmail: selectedStudent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onMemberAdded();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add member');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Add Group Member</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Student</label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            required
                        >
                            <option value="">Choose a student</option>
                            {availableStudents.map(student => (
                                <option key={student.email} value={student.email}>
                                    {student.username} ({student.rollno})
                                </option>
                            ))}
                        </select>
                    </div>

                    {availableStudents.length === 0 && (
                        <p className="no-students-message">
                            No available students from your semester and department
                        </p>
                    )}

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="add-button"
                            disabled={!selectedStudent || availableStudents.length === 0}
                        >
                            Add Member
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddMemberModal; 