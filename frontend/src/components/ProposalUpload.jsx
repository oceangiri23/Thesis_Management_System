import React, { useState, useEffect } from "react";
import axios from "axios";

const ProposalUpload = ({ groupId, isGroupMember }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [success, setSuccess] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    fetchDeadline();
    fetchCurrentSubmission();
  }, [groupId]);

  const fetchDeadline = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/deadline/${groupId}`
      );
      setDeadline(response.data.deadline);
    } catch (err) {
      console.error("Failed to fetch deadline:", err);
    }
  };

  const fetchCurrentSubmission = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/current/${groupId}`
      );
      if (response.data.filename) {
        setUploadedFile(response.data.filename);
      }
    } catch (err) {
      console.error("Failed to fetch current submission:", err);
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
      setSuccess("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    // Check if deadline has passed
    if (deadline && new Date(deadline) < new Date()) {
      setError("Deadline has passed");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        try {
          const response = await axios.post(
            `http://localhost:5000/api/proposals/upload/${groupId}`,
            { file: reader.result }
          );
          setSuccess("Proposal uploaded successfully");
          setSelectedFile(null);
          setUploadedFile(response.data.filename);
          // Reset file input
          e.target.reset();
        } catch (err) {
          setError(err.response?.data?.message || "Failed to upload file");
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      setError("Failed to process file");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!uploadedFile) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/download/${uploadedFile}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", uploadedFile);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download file");
    }
  };

  const handleView = async () => {
    if (!uploadedFile) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/download/${uploadedFile}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      window.open(url, "_blank");
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to view file");
    }
  };

  const handleCancelSubmission = async () => {
    if (!uploadedFile) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/proposals/cancel/${groupId}`
      );
      setUploadedFile(null);
      setSuccess("Submission cancelled successfully");
    } catch (err) {
      setError("Failed to cancel submission");
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Thesis Proposal</h3>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {deadline && (
        <div className="mb-4">
          <p>
            Submission Deadline: {new Date(deadline).toLocaleString()}
            {new Date(deadline) < new Date() && (
              <span className="text-red-500 ml-2">(Passed)</span>
            )}
          </p>
        </div>
      )}

      {isGroupMember && !uploadedFile && (
        <form onSubmit={handleUpload} className="flex flex-col gap-2">
          <div>
            <label
              htmlFor="proposal"
              className="block text-sm font-medium text-gray-700"
            >
              Upload Proposal (PDF only)
            </label>
            <input
              type="file"
              id="proposal"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-fit px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300"
          >
            {loading ? "Uploading..." : "Upload Proposal"}
          </button>
        </form>
      )}

      {uploadedFile && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm text-gray-600">
              Current proposal:{" "}
              {uploadedFile.replace(`proposal_${groupId}_`, "")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleView}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Proposal
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Download
            </button>
            {isGroupMember && (
              <button
                onClick={handleCancelSubmission}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Cancel Submission
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalUpload;
