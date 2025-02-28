import React, { useState, useEffect } from "react";
import "./GroupCard.css";
import JoinEligibility from "./JoinEligibility";
import AddMemberModal from "./AddMemberModal";
import ProposalDeadline from "./ProposalDeadline";
import ProposalUpload from "./ProposalUpload";
import ProposalThread from "./ProposalThread";
import ThesisThread from "./ThesisThread";
import axios from "axios";

const GroupCard = ({
  group,
  user,
  onJoinRequest,
  onRequestResponse,
  onApproval,
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  useEffect(() => {
    if (group.approval_status === "approved") {
      fetchCurrentSubmission();
    }
  }, [group.id, group.approval_status]);

  const fetchCurrentSubmission = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/current/${group.id}`
      );
      setCurrentSubmission(response.data);
    } catch (err) {
      console.error("Failed to fetch current submission:", err);
    }
  };

  const canJoin =
    user.role === "student" &&
    !group.Students?.find((s) => s.email === user.email) &&
    group.number_of_member < 4 &&
    group.approval_status === "approved" &&
    user.semester === group.semester &&
    user.department === group.department;

  const isPending = group.JoinRequests?.some(
    (req) => req.StudentEmail === user.email && req.status === "pending"
  );

  const isGroupMember = group.Students?.some((s) => s.email === user.email);
  const canAddMembers = isGroupMember && group.number_of_member < 4;
  const isSupervisor =
    user.role === "supervisor" && group.SupervisorEmail === user.email;

  const handleApproval = (status) => {
    if (status === "rejected" && !rejectionReason) {
      setShowRejectModal(true);
      return;
    }
    onApproval(group.id, status, rejectionReason);
    setShowRejectModal(false);
    setRejectionReason("");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              {group.team_name}
            </h3>
            <p className="text-lg text-gray-600 mt-1">{group.thesis_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                group.approval_status === "approved"
                  ? "bg-green-100 text-green-800"
                  : group.approval_status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {group.approval_status}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {group.number_of_member}/4 members
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Department
            </h4>
            <p className="text-gray-900">{group.department}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Semester</h4>
            <p className="text-gray-900">{group.semester}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Project Status
            </h4>
            <p className="text-gray-900">{group.project_status}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Description
            </h4>
            <p className="text-gray-900">{group.description}</p>
          </div>
        </div>

        {group.rejection_reason && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-1">
              Rejection Reason:
            </h4>
            <p className="text-red-700">{group.rejection_reason}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-gray-800">Members</h4>
            {canAddMembers && (
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                         transition-colors flex items-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Member
              </button>
            )}
          </div>
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
                <span className="text-gray-700">{student.username}</span>
              </div>
            ))}
          </div>
        </div>

        {user.role === "supervisor" &&
          group.SupervisorEmail === user.email &&
          group.approval_status === "pending" && (
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => handleApproval("approved")}
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
                onClick={() => handleApproval("rejected")}
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

        {user.role === "supervisor" && group.JoinRequests?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-800 mb-3">
              Join Requests
            </h4>
            <div className="space-y-3">
              {group.JoinRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
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
                    <span className="font-medium text-gray-700">
                      {request.Student.username}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onRequestResponse(request.id, "accepted")}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-md 
                               hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Accept
                    </button>
                    <button
                      onClick={() => onRequestResponse(request.id, "rejected")}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-md 
                               hover:bg-red-600 transition-colors flex items-center gap-1"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!canJoin && user.role === "student" && !isPending && (
          <div className="mb-6">
            <JoinEligibility group={group} user={user} />
          </div>
        )}

        {canJoin && !isPending && (
          <button
            onClick={() => onJoinRequest(group.id)}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md 
                     hover:bg-blue-600 transition-colors flex items-center 
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            Request to Join
          </button>
        )}

        {isPending && (
          <div
            className="p-3 bg-yellow-50 border border-yellow-100 rounded-md text-yellow-700 
                        flex items-center justify-center gap-2"
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Join Request Pending
          </div>
        )}

        {/* Show proposal features only for approved groups */}
        {group.approval_status === "approved" && (
          <div className="mt-8 space-y-6">
            <ProposalThread
              groupId={group.id}
              isSupervisor={isSupervisor}
              isGroupMember={isGroupMember}
            />
            <ThesisThread
              groupId={group.id}
              isSupervisor={isSupervisor}
              isGroupMember={isGroupMember}
            />
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Provide Rejection Reason
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 
                       focus:ring-blue-500 min-h-[120px]"
              required
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md 
                         hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproval("rejected")}
                className="px-4 py-2 bg-red-500 text-white rounded-md 
                         hover:bg-red-600 transition-colors"
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
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default GroupCard;
