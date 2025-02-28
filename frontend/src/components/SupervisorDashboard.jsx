import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import GroupCard from "./GroupCard";
import ProposalThread from "./ProposalThread";
import ThesisThread from "./ThesisThread";

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchGroups();
    }
  }, [user?.email]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/supervisors/groups/${user.email}`
      );
      setGroups(response.data);
    } catch (err) {
      setError("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResponse = async (requestId, status) => {
    try {
      await axios.post(
        `http://localhost:5000/api/groups/join-request/${requestId}`,
        {
          status,
        }
      );
      fetchGroups();
    } catch (err) {
      setError("Failed to respond to join request");
    }
  };

  const handleApproval = async (groupId, status, rejectionReason) => {
    try {
      await axios.put(`http://localhost:5000/api/groups/${groupId}/approval`, {
        status,
        rejection_reason: rejectionReason,
      });
      fetchGroups();
    } catch (err) {
      setError("Failed to update group status");
    }
  };

  if (!user) {
    return <div>Loading user information...</div>;
  }

  if (loading) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Supervised Thesis Projects
        </h2>
        <div className="overflow-hidden bg-white shadow-sm border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Group Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thesis Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {groups.map((group) => (
                <React.Fragment key={group.id}>
                  <tr
                    className={`hover:bg-gray-50 ${
                      selectedGroup === group.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {group.team_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {group.thesis_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.Students?.map(
                          (student) => student.username
                        ).join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          group.approval_status === "approved"
                            ? "bg-green-100 text-green-800"
                            : group.approval_status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {group.approval_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {group.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          setSelectedGroup(
                            selectedGroup === group.id ? null : group.id
                          )
                        }
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        {selectedGroup === group.id ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                            Hide Details
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                            View Details
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                  {selectedGroup === group.id && (
                    <tr>
                      <td colSpan="6" className="px-6 py-4">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Thesis Title
                              </h4>
                              <p className="text-gray-900">
                                {group.thesis_name}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Description
                              </h4>
                              <p className="text-gray-900">
                                {group.description}
                              </p>
                            </div>
                          </div>

                          <div className="mb-6">
                            <h4 className="text-lg font-medium text-gray-800 mb-3">
                              Team Members
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              {group.Students?.map((student) => (
                                <div
                                  key={student.email}
                                  className="p-3 bg-gray-50 rounded-md flex items-center gap-3"
                                >
                                  <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  <div>
                                    <p className="font-medium">
                                      {student.username}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {student.email}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {group.approval_status === "pending" && (
                            <div className="flex gap-3">
                              <button
                                onClick={() =>
                                  handleApproval(group.id, "approved")
                                }
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md 
                                       hover:bg-green-600 transition-colors flex items-center 
                                       justify-center gap-2"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Approve Group
                              </button>
                              <button
                                onClick={() =>
                                  handleApproval(group.id, "rejected")
                                }
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md 
                                       hover:bg-red-600 transition-colors flex items-center 
                                       justify-center gap-2"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Reject Group
                              </button>
                            </div>
                          )}

                          {group.approval_status === "approved" && (
                            <div className="mt-6">
                              <ProposalThread
                                groupId={group.id}
                                isSupervisor={true}
                                isGroupMember={false}
                              />
                              <ThesisThread
                                groupId={group.id}
                                isSupervisor={true}
                                isGroupMember={false}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorDashboard;
