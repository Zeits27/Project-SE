import { useState } from 'react';
import axios from 'axios';

export default function CommunityForm({ name, setName, description, setDescription }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!name || !description) {
      setError("Both name and description are required.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const userResponse = await axios.get("http://localhost:8080/api/user_id", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const userId = userResponse.data.user_id;
      if (!userId) {
        setError("User ID not found.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/api/community",
        { name, description, user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("Data submitted successfully:", response.data);
      setSuccess(true);
      setName("");
      setDescription("");
    } catch (err) {
      console.error("Error submitting data:", err);
      setError("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Community created successfully!</p>}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md text-sm"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Enter community name"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full p-2 border rounded-md text-sm"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Describe your community"
          rows={4}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? "Creating..." : "Create Community"}
      </button>
    </div>
  );
}
