import { useState } from "react";
import axios from "axios";

export default function LiveClassForm({
  name,
  setName,
  description,
  setDescription,
  link,
  setLink,
  dateTime,
  setDateTime,
}) {
  const [subject, setSubject] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const subjects = [
    "Math",
    "Biology",
    "History",
    "Mental Health",
    "Physics",
    "Chemistry",
    "Literature",
    "Technology",
    "Art",
    "Philosophy",
  ];

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!name || !description || !link || !dateTime || !subject) {
      setError("All fields including subject are required.");
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
        headers: { Authorization: `Bearer ${token}` },
      });

      const userId = userResponse.data.user_id;
      if (!userId) {
        setError("User ID not found.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/api/live-class",
        { name, description, link, date_time: dateTime, subject, user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Live class submitted:", response.data);
      setSuccess(true);
      setName("");
      setDescription("");
      setLink("");
      setDateTime("");
      setSubject("");
    } catch (err) {
      console.error("Live class error:", err);
      setError("Failed to submit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Create Live Class</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Live class created successfully!</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Class title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Class details"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link</label>
        <input
          type="url"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Zoom/Meet link"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date & Time</label>
        <input
          type="datetime-local"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={dateTime}
          onChange={(e) => {
            setDateTime(e.target.value);
            setError("");
            setSuccess(false);
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <select
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setError("");
            setSuccess(false);
          }}
        >
          <option value="">Select a subject</option>
          {subjects.map((subj) => (
            <option key={subj} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? "Submitting..." : "Create Live Class"}
      </button>
    </div>
  );
}
