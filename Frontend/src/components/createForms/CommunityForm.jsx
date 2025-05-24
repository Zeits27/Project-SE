import { useState } from 'react';
import axios from 'axios';

export default function CommunityForm({ name, setName, description, setDescription }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [image, setImage] = useState(null);     // Cover image
  const [banner, setBanner] = useState(null);   // Banner image

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!name || !description || !image || !banner) {
      setError("All fields including cover image and banner image are required.");
      return;
    }

    if (description.length > 100) {
      setError("Description cannot be more than 100 characters.");
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

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("user_id", userId);
      formData.append("cover_image", image);
      formData.append("banner_image", banner);

      const response = await axios.post(
        "http://localhost:8080/api/community",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      console.log("Community submitted successfully:", response.data);
      setSuccess(true);
      setName("");
      setDescription("");
      setImage(null);
      setBanner(null);
    } catch (err) {
      console.error("Error submitting community:", err);
      setError("Failed to create community. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Create a Community</h2>

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
          className={`w-full p-2 border rounded-md text-sm ${
            description.length > 100 ? "border-red-500" : ""
          }`}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setError("");
            setSuccess(false);
          }}
          placeholder="Describe your community"
          rows={4}
        />
        <div className="text-xs text-gray-500">
          {description.length}/100 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Image</label>
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
          <div className="text-sm text-gray-600 mt-1 w-full border rounded-md px-3 py-2 ">
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

      <div>
        <label className="block text-sm font-medium mb-1">Banner Image</label>
        {!banner ? (
          <input
            type="file"
            accept="image/*"
            className="w-full border rounded-md px-3 py-2 text-sm"
            onChange={(e) => {
              setBanner(e.target.files[0]);
              setError("");
              setSuccess(false);
            }}
          />
        ) : (
          <div className="text-sm text-gray-600 mt-1 w-full border rounded-md px-3 py-2 ">
            Selected file: {banner.name}
            <button
              onClick={() => setBanner(null)}
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
        {loading ? "Creating..." : "Create Community"}
      </button>
    </div>
  );
}
