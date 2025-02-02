import React from 'react';
import './JoinEligibility.css';

const JoinEligibility = ({ group, user }) => {
    if (!user || user.role !== 'student') return null;

    const checks = [
        {
            passed: user.semester === group.semester,
            message: 'Must be from same semester',
        },
        {
            passed: user.department === group.department,
            message: 'Must be from same department',
        },
        {
            passed: group.number_of_member < 4,
            message: 'Group must have space (max 4 members)',
        },
        {
            passed: group.approval_status === 'approved',
            message: 'Group must be approved by supervisor',
        }
    ];

    const failedChecks = checks.filter(check => !check.passed);

    if (failedChecks.length === 0) return null;

    return (
        <div className="join-eligibility">
            <h5>Cannot Join Because:</h5>
            <ul>
                {failedChecks.map((check, index) => (
                    <li key={index}>• {check.message}</li>
                ))}
            </ul>
        </div>
    );
};

export default JoinEligibility; 