import React, { useState, useEffect } from "react";
import axios from "axios";

const ProposalDeadline = ({ groupId, isSupervisor }) => {
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchDeadline();
  }, [groupId]);

  const fetchDeadline = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/proposals/deadline/${groupId}`
      );
      setDeadline(response.data.deadline);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError("Failed to fetch deadline");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetDeadline = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `http://localhost:5000/api/proposals/deadline/${groupId}`,
        {
          deadline: e.target.deadline.value,
        }
      );
      setDeadline(e.target.deadline.value);
      setSuccess("Deadline set successfully");
      e.target.reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set deadline");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Proposal Deadline</h3>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}

      {deadline && (
        <div className="mb-4">
          <p>
            Current Deadline: {new Date(deadline).toLocaleString()}
            {new Date(deadline) < new Date() && (
              <span className="text-red-500 ml-2">(Passed)</span>
            )}
          </p>
        </div>
      )}

      {isSupervisor && (
        <form onSubmit={handleSetDeadline} className="flex flex-col gap-2">
          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-700"
            >
              {deadline ? "Update Deadline" : "Set Deadline"}
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-fit px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {deadline ? "Update Deadline" : "Set Deadline"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ProposalDeadline;
