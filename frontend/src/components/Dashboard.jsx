import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.role === 'student' && (
                        <>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Your Group</h3>
                                <p>{user.StudentGroup ? user.StudentGroup.team_name : 'Not assigned to a group'}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Department</h3>
                                <p>{user.department}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Semester</h3>
                                <p>{user.semester}</p>
                            </div>
                        </>
                    )}
                    {user.role === 'supervisor' && (
                        <>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Department</h3>
                                <p>{user.department}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Groups Supervised</h3>
                                <p>{user.no_of_group_supervised}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Contact</h3>
                                <p>{user.phone_number}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 