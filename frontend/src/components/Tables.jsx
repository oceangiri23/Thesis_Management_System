import axios from "axios";
import { useAuth } from "../context/AuthContext";
import GroupCard from "./GroupCard";
import ProposalThread from "./ProposalThread";
import ThesisThread from "./ThesisThread";
import { useEffect, useState } from "react";
import React from "react";

const Tables = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (user?.email) {
      fetchGroups();
    }
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/`);
      setGroups(response.data);
    } catch (err) {
      setError("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchFileNames = async (groupId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/thesis/history/${groupId}`
      );
      return response.data[0].filename;
    } catch (err) {
      console.error("Failed to fetch file names:", err);
      return [];
    }
  };

  const handleDownload = async (groupId) => {
    const file = await fetchFileNames(groupId);
    if (file) window.location.href = `http://localhost:5000/file/${file}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Thesis Projects
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
              {groups.map(
                (group) =>
                  group.project_status === "completed" && (
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
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {group.project_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {group.department}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <a
                            onClick={() => handleDownload(group.id)}
                            href="#"
                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            Download Thesis
                          </a>
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
                  )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tables;
