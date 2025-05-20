import { useState } from 'react';
import axios from 'axios';

export default function BookForm({ title, setTitle, author, setAuthor, description, setDescription }) {
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
    "Philosophy"
  ];

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!title || !author || !description || !subject) {
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
        headers: { Authorization: `Bearer ${token}` }
      });

      const userId = userResponse.data.user_id;
      if (!userId) {
        setError("User ID not found.");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/api/book",
        { title, author, description, subject, user_id: userId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log("Book submitted successfully:", response.data);
      setSuccess(true);
      setTitle("");
      setAuthor("");
      setDescription("");
      setSubject("");
    } catch (err) {
      console.error("Error submitting book:", err);
      setError("Failed to submit book. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Add a Book</h2>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Book added successfully!</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Book title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Author</label>
        <input
          type="text"
          className="w-full border rounded-md px-3 py-2 text-sm"
          value={author}
          onChange={(e) => {
            setAuthor(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Author name"
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
          placeholder="What is this book about?"
          rows={4}
        />
      </div>

      

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? "Submitting..." : "Add Book"}
      </button>
    </div>
  );
}
