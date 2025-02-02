import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './CreateGroupModal.css';

const CreateGroupModal = ({ onClose, onCreate, supervisors }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        team_name: '',
        thesis_name: '',
        description: '',
        SupervisorEmail: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!formData.SupervisorEmail) {
            setError('Please select a supervisor');
            return;
        }

        onCreate({
            ...formData,
            creatorEmail: user.email
        });
    };

    const filteredSupervisors = supervisors.filter(
        supervisor => supervisor.department === user.department
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Create New Group</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Team Name</label>
                        <input
                            type="text"
                            name="team_name"
                            value={formData.team_name}
                            onChange={handleChange}
                            placeholder="Enter team name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Thesis Topic</label>
                        <input
                            type="text"
                            name="thesis_name"
                            value={formData.thesis_name}
                            onChange={handleChange}
                            placeholder="Enter thesis topic"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your thesis project"
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Department</label>
                        <input
                            type="text"
                            value={user.department}
                            disabled
                            className="disabled-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Semester</label>
                        <input
                            type="text"
                            value={user.semester}
                            disabled
                            className="disabled-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Supervisor (from your department)</label>
                        <select
                            name="SupervisorEmail"
                            value={formData.SupervisorEmail}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Choose a supervisor</option>
                            {filteredSupervisors.map(supervisor => (
                                <option key={supervisor.email} value={supervisor.email}>
                                    {supervisor.username} ({supervisor.no_of_group_supervised} groups)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="cancel-button">
                            Cancel
                        </button>
                        <button type="submit" className="create-button">
                            Create Group
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal; 