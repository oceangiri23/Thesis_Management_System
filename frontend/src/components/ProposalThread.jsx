import React, { useState, useEffect } from "react";
import axios from "axios";
import ProposalDeadline from "./ProposalDeadline";

const ProposalThread = ({ groupId, isSupervisor, isGroupMember }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [groupId]);

  const updateRemainingTime = () => {
    const latestSubmission = submissions[0];
    if (latestSubmission?.deadline) {
      const deadline = new Date(latestSubmission.deadline);
      const now = new Date();
      const diff = deadline - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setRemainingTime({ days, hours, minutes });
      } else {
        setRemainingTime({ expired: true });
      }
    } else {
      setRemainingTime(null);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/submissions/${groupId}`
      );
      setSubmissions(response.data);
    } catch (err) {
      setError("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed");
        e.target.value = "";
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleRevisionUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    if (remainingTime?.expired) {
      setError("Revision deadline has passed");
      return;
    }

    setUploadLoading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        try {
          await axios.post(
            `http://localhost:5000/api/proposals/upload/${groupId}`,
            { file: reader.result }
          );
          setSelectedFile(null);
          e.target.reset();
          fetchSubmissions();
        } catch (err) {
          setError(err.response?.data?.message || "Failed to upload file");
        } finally {
          setUploadLoading(false);
        }
      };
    } catch (err) {
      setError("Failed to process file");
      setUploadLoading(false);
    }
  };

  const handleReview = async (submissionId, status) => {
    if (status === "needs_revision" && !feedback) {
      setError("Please provide feedback for revision");
      return;
    }

    if (status === "needs_revision" && !newDeadline) {
      setError("Please set a new deadline for revision");
      return;
    }

    setReviewLoading(true);
    setError("");

    try {
      await axios.post(
        `http://localhost:5000/api/proposals/review/${submissionId}`,
        {
          status,
          feedback: status === "needs_revision" ? feedback : "Approved",
          deadline: status === "needs_revision" ? newDeadline : null,
        }
      );

      fetchSubmissions();
      setFeedback("");
      setNewDeadline("");
    } catch (err) {
      setError("Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/download/${filename}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download file");
    }
  };

  const handleView = async (filename) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/download/${filename}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to view file");
    }
  };

  if (loading) return <div>Loading...</div>;

  const latestSubmission = submissions[0];
  const needsRevision = latestSubmission?.status === "needs_revision";
  const hasActiveSubmission = latestSubmission?.status === "pending";
  const canSubmit = isGroupMember && (!latestSubmission || needsRevision);

  return (
    <div className="space-y-6">
      {/* Deadline Section */}
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Proposal Status</h3>
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

          {remainingTime && !remainingTime.expired ? (
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
                Deadline: {new Date(latestSubmission.deadline).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Upload Section */}
      {canSubmit && (
        <div className="p-4 border rounded-lg bg-white shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {needsRevision ? "Submit Revision" : "Submit Proposal"}
          </h3>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleRevisionUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload {needsRevision ? "Revised " : ""}Proposal (PDF only)
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  border border-gray-300 rounded-md"
                required
              />
            </div>
            <button
              type="submit"
              disabled={
                uploadLoading ||
                !selectedFile ||
                (remainingTime?.expired && needsRevision)
              }
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {uploadLoading
                ? "Uploading..."
                : `Submit ${needsRevision ? "Revision" : "Proposal"}`}
            </button>
          </form>
        </div>
      )}

      {/* History Thread */}
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
                Submitted on {new Date(submission.submittedAt).toLocaleString()}
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
                  <p className="text-sm text-gray-600">{submission.feedback}</p>
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
                          value={newDeadline}
                          onChange={(e) => setNewDeadline(e.target.value)}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col justify-end space-y-3">
                      <button
                        onClick={() => handleReview(submission.id, "approved")}
                        disabled={reviewLoading}
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
                        disabled={reviewLoading || !feedback || !newDeadline}
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
            <p className="text-gray-500 text-center py-4">No submissions yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalThread;
