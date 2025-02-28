import React, { useState } from "react";
import axios from "axios";

const SetDeadline = ({ groupId, onDeadlineSet }) => {
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `http://localhost:5000/api/proposals/deadline/${groupId}`,
        {
          deadline,
        }
      );
      onDeadlineSet(deadline);
      setDeadline("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set deadline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Set Proposal Deadline</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="border rounded px-2 py-1"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Setting..." : "Set Deadline"}
        </button>
      </form>
    </div>
  );
};

export default SetDeadline;
