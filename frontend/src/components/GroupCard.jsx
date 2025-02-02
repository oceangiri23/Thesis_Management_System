import React, { useState } from 'react';
import './GroupCard.css';
import JoinEligibility from './JoinEligibility';
import AddMemberModal from './AddMemberModal';

const GroupCard = ({ group, user, onJoinRequest, onRequestResponse, onApproval }) => {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    const canJoin = user.role === 'student' && 
        !group.Students?.find(s => s.email === user.email) &&
        group.number_of_member < 4 &&
        group.approval_status === 'approved' &&
        user.semester === group.semester &&
        user.department === group.department;

    const isPending = group.JoinRequests?.some(
        req => req.StudentEmail === user.email && req.status === 'pending'
    );

    const isGroupMember = group.Students?.some(s => s.email === user.email);
    const canAddMembers = isGroupMember && group.number_of_member < 4;

    const handleApproval = (status) => {
        if (status === 'rejected' && !rejectionReason) {
            setShowRejectModal(true);
            return;
        }
        onApproval(group.id, status, rejectionReason);
        setShowRejectModal(false);
        setRejectionReason('');
    };

    return (
        <div className="group-card">
            <div className="group-header">
                <h3>{group.team_name}</h3>
                <div className="group-status">
                    <span className={`status-badge ${group.approval_status}`}>
                        {group.approval_status}
                    </span>
                    <span className="member-count">
                        {group.number_of_member}/4 members
                    </span>
                </div>
            </div>
            
            <div className="group-info">
                <p className="thesis-name">{group.thesis_name}</p>
                <p className="description">{group.description}</p>
                <div className="details">
                    <p><strong>Department:</strong> {group.department}</p>
                    <p><strong>Semester:</strong> {group.semester}</p>
                    <p><strong>Status:</strong> {group.project_status}</p>
                    <p><strong>Members:</strong> {group.number_of_member}/4</p>
                </div>
                {group.rejection_reason && (
                    <div className="rejection-reason">
                        <p><strong>Rejection Reason:</strong></p>
                        <p>{group.rejection_reason}</p>
                    </div>
                )}
            </div>

            <div className="members-section">
                <div className="members-header">
                    <h4>Members:</h4>
                    {canAddMembers && (
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="add-member-btn"
                        >
                            Add Member
                        </button>
                    )}
                </div>
                <ul>
                    {group.Students?.map(student => (
                        <li key={student.email}>{student.username}</li>
                    ))}
                </ul>
            </div>

            {user.role === 'supervisor' && 
             group.SupervisorEmail === user.email && 
             group.approval_status === 'pending' && (
                <div className="approval-actions">
                    <button
                        onClick={() => handleApproval('approved')}
                        className="approve-btn"
                    >
                        Approve Group
                    </button>
                    <button
                        onClick={() => handleApproval('rejected')}
                        className="reject-btn"
                    >
                        Reject Group
                    </button>
                </div>
            )}

            {user.role === 'supervisor' && group.JoinRequests?.length > 0 && (
                <div className="join-requests">
                    <h4>Join Requests:</h4>
                    {group.JoinRequests.map(request => (
                        <div key={request.id} className="request-item">
                            <span>{request.Student.username}</span>
                            <div className="request-actions">
                                <button
                                    onClick={() => onRequestResponse(request.id, 'accepted')}
                                    className="accept-btn"
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => onRequestResponse(request.id, 'rejected')}
                                    className="reject-btn"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!canJoin && user.role === 'student' && !isPending && (
                <JoinEligibility group={group} user={user} />
            )}

            {canJoin && !isPending && (
                <button
                    onClick={() => onJoinRequest(group.id)}
                    className="join-btn"
                    disabled={isPending}
                >
                    Request to Join
                </button>
            )}
            {isPending && (
                <span className="pending-badge">Join Request Pending</span>
            )}

            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Provide Rejection Reason</h3>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Please provide a reason for rejection"
                            rows="4"
                            required
                        />
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleApproval('rejected')}
                                className="confirm-btn"
                                disabled={!rejectionReason}
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddMemberModal && (
                <AddMemberModal
                    groupId={group.id}
                    onClose={() => setShowAddMemberModal(false)}
                    onMemberAdded={() => {
                        setShowAddMemberModal(false);
                        // Refresh groups data
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default GroupCard; 