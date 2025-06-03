import { useState } from "react";
import axios from "axios";

export default function ClassesForm() {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!name || !image) {
      setError("Name and image are required.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);

      const response = await axios.post("http://localhost:8080/api/class", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Class created:", response.data);
      setSuccess(true);
      setName("");
      setImage(null);
    } catch (err) {
      console.error(err);
      setError("Failed to create class.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Create a Class</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Class created successfully!</p>}

      <div className="space-y-1">
        <label className="block text-sm font-medium">Class Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded-md text-sm"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Enter class name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Class Image</label>
        {!image ? (
          <input
            type="file"
            accept="image/*"
            className="w-full border rounded-md px-3 py-2 text-sm"
            onChange={(e) => {
              setImage(e.target.files[0]);
              setError("");
              setSuccess(false);
            }}
          />
        ) : (
          <div className="text-sm text-gray-600 mt-1 w-full border rounded-md px-3 py-2">
            Selected file: {image.name}
            <button
              onClick={() => setImage(null)}
              className="ml-2 text-blue-600 underline text-xs"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
      >
        {loading ? "Creating..." : "Create Class"}
      </button>
    </div>
  );
}

  