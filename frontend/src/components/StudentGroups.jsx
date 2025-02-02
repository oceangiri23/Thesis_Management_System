import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CreateGroupModal from './CreateGroupModal';
import GroupCard from './GroupCard';
import './StudentGroups.css';

const StudentGroups = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [supervisors, setSupervisors] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        fetchGroups();
        if (user.role === 'student') {
            fetchSupervisors();
        }
    }, [user.role]);

    const fetchGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = user.role === 'supervisor' 
                ? `/api/groups/supervised`
                : '/api/groups';
            
            const response = await axios.get(`http://localhost:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGroups(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching groups:', error);
            setError('Failed to fetch groups');
            setLoading(false);
        }
    };

    const fetchSupervisors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/supervisors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSupervisors(response.data);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        }
    };

    const handleCreateGroup = async (groupData) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/groups', groupData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGroups();
            setShowCreateModal(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create group');
        }
    };

    const handleJoinRequest = async (groupId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/groups/${groupId}/join-requests`, {
                studentEmail: user.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Join request sent successfully');
            fetchGroups();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send join request';
            alert(errorMessage);
        }
    };

    const handleRequestResponse = async (requestId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/groups/join-requests/${requestId}`, {
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchGroups();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update request');
        }
    };

    const handleGroupApproval = async (groupId, status, rejectionReason = null) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/groups/${groupId}/approval`, {
                status,
                rejection_reason: rejectionReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Group ${status} successfully`);
            fetchGroups();
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${status} group`);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    const userGroup = user.role === 'student' ? 
        groups.find(g => g.Students?.some(s => s.email === user.email)) : null;

        console.log(userGroup);
        console.log(user);
    return (
        <div className="student-groups-container">
            <div className="header">
                <h1>{user.role === 'supervisor' ? 'Supervised Groups' : 'Student Groups'}</h1>
                {user?.role == 'student' && !userGroup && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="create-group-btn"
                    >
                        Create New Group
                    </button>
                )}
            </div>

            {userGroup && (
                <div className="my-group-section">
                    <h2>My Group</h2>
                    <GroupCard
                        group={userGroup}
                        user={user}
                        onJoinRequest={handleJoinRequest}
                        onRequestResponse={handleRequestResponse}
                        onApproval={handleGroupApproval}
                    />
                </div>
            )}

            <div className="all-groups-section">
                <h2>{userGroup ? 'Other Groups' : 'Available Groups'}</h2>
                <div className="groups-grid">
                    {groups
                        .filter(g => g.id !== userGroup?.id)
                        .map(group => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                user={user}
                                onJoinRequest={handleJoinRequest}
                                onRequestResponse={handleRequestResponse}
                                onApproval={handleGroupApproval}
                            />
                        ))}
                </div>
            </div>

            {showCreateModal && (
                <CreateGroupModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateGroup}
                    supervisors={supervisors}
                />
            )}
        </div>
    );
};

export default StudentGroups; 