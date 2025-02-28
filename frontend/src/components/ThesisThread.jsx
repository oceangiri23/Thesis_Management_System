import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, set } from "date-fns";
import SetThesisDeadline from "./SetThesisDeadline.jsx";

const ThesisThread = ({ groupId, isSupervisor, isGroupMember }) => {
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [deadline, setDeadline] = useState("");
  const [finalGrade, setFinalGrade] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [thesisDeadline, setThesisDeadline] = useState(null);
  const [finalUploadStatus, setFinalUploadStatus] = useState("");
  const [latestSubmission, setLatestSubmission] = useState(null);

  useEffect(() => {
    fetchSubmissions();
    fetchThesisDeadline();
  }, [groupId]);

  const fetchSubmissions = async () => {
    try {
      const [currentRes, historyRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/thesis/current/${groupId}`),
        axios.get(`http://localhost:5000/api/thesis/history/${groupId}`),
      ]);
      setCurrentSubmission(currentRes.data || null);
      setSubmissions(historyRes.data || []);
      if (historyRes.data.length > 0) {
        setFinalUploadStatus(historyRes.data[0].status);
        setLatestSubmission(historyRes.data[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to fetch thesis submissions");
      setSubmissions([]);
      setCurrentSubmission(null);
      setLoading(false);
    }
  };

  const fetchThesisDeadline = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/thesis/deadline/${groupId}`
      );
      setThesisDeadline(response.data.deadline);
    } catch (err) {
      console.error("Failed to fetch thesis deadline:", err);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(
        `http://localhost:5000/api/thesis/${groupId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSelectedFile(null);
      fetchSubmissions();
    } catch (err) {
      setError("Failed to submit thesis");
    }
  };

  const handleReview = async (submissionId, status) => {
    try {
      await axios.post(
        `http://localhost:5000/api/thesis/${submissionId}/review`,
        {
          status,
          feedback,
          deadline: deadline || null,
          finalGrade: status === "final_approved" ? finalGrade : null,
        }
      );
      setFeedback("");
      setDeadline("");
      setFinalGrade("");
      fetchSubmissions();
    } catch (err) {
      setError("Failed to update thesis status");
    }
  };

  const handleDownload = async (filename) => {
    try {
      window.open(`http://localhost:5000/api/thesis/download/${filename}`);
    } catch (err) {
      setError("Failed to download file");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thesis Submission
        </h3>

        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Thesis Status</h3>
          <div className="flex flex-col gap-2">
            {latestSubmission && (
              <div
                className={`flex items-center gap-2 ${
                  latestSubmission.status === "approved"
                    ? "text-green-600"
                    : latestSubmission.status === "needs_revision"
                    ? "text-yellow-600"
                    : "text-blue-600"
                }`}
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  Status: {latestSubmission.status.replace("_", " ")}
                </span>
              </div>
            )}

            {/* {remainingTime && !remainingTime.expired ? (
              <div className="flex items-center gap-2 text-blue-600">
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
                <p>
                  Time Remaining:{" "}
                  <span className="font-medium">
                    {remainingTime.days} days, {remainingTime.hours} hours,{" "}
                    {remainingTime.minutes} minutes
                  </span>
                </p>
              </div>
            ) : latestSubmission?.deadline ? (
              <div className="flex items-center gap-2 text-red-600">
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
                <p>
                  Deadline:{" "}
                  {new Date(latestSubmission.deadline).toLocaleString()}
                </p>
              </div>
            ) : null} */}
          </div>
        </div>

        {isSupervisor && !thesisDeadline && (
          <SetThesisDeadline
            groupId={groupId}
            onDeadlineSet={(deadline) => setThesisDeadline(deadline)}
          />
        )}
        {thesisDeadline && finalUploadStatus != "approved" && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-blue-700">
              Submission Deadline: {new Date(thesisDeadline).toLocaleString()}
              {new Date(thesisDeadline) < new Date() && (
                <span className="text-red-500 ml-2">(Passed)</span>
              )}
            </p>
          </div>
        )}

        {isGroupMember && finalUploadStatus != "approved" && (
          <div className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Thesis Document
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-md file:border-0
                           file:text-sm file:font-medium
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100"
                  accept=".pdf,.doc,.docx"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedFile}
                className="px-4 py-2 bg-blue-500 text-white rounded-md
                         hover:bg-blue-600 transition-colors disabled:bg-gray-300"
              >
                Submit Thesis
              </button>
            </form>
          </div>
        )}

        {submissions.length > 0 ? (
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Submission History</h3>

            <div className="space-y-4">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">
                        {submission.filename}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        submission.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : submission.status === "needs_revision"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {submission.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mb-3">
                    Submitted on{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => handleView(submission.filename)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md 
                           hover:bg-gray-50 flex items-center gap-1"
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(submission.filename)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md 
                           hover:bg-gray-50 flex items-center gap-1"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download
                    </button>
                  </div>

                  {submission.feedback && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-md">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Feedback:
                      </p>
                      <p className="text-sm text-gray-600">
                        {submission.feedback}
                      </p>
                      {submission.deadline && (
                        <p className="text-sm text-gray-600 mt-2">
                          Revision Deadline:{" "}
                          {new Date(submission.deadline).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Supervisor Review Section */}
                  {isSupervisor && submission.status === "pending" && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-lg font-semibold mb-4">
                        Review Submission
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4 md:pr-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Provide Feedback
                            </label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500
                                   min-h-[120px] resize-none"
                              placeholder="Enter your feedback here..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Set Revision Deadline
                            </label>
                            <input
                              type="datetime-local"
                              value={deadline}
                              onChange={(e) => setDeadline(e.target.value)}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col justify-end space-y-3">
                          <button
                            onClick={() =>
                              handleReview(submission.id, "approved")
                            }
                            className="w-full px-4 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 
                                 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2
                                 font-medium"
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
                            Approve Proposal
                          </button>
                          <button
                            onClick={() =>
                              handleReview(submission.id, "needs_revision")
                            }
                            disabled={!feedback || !deadline}
                            className="w-full px-4 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 
                                 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2
                                 font-medium"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Request Revision
                          </button>
                          {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {submissions.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No submissions yet
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No thesis submissions yet.</p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
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

export default ThesisThread;
