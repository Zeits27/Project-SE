import { useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";

const types = ["Community", "Classes", "Live Class", "Books"];

export default function CreateOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("Community");

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [link, setLink] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const resetForm = () => {
    setImage(null);
    setPreview(null);
    setName("");
    setDescription("");
    setSubject("");
    setLink("");
    setDateTime("");
    setTitle("");
    setAuthor("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      type: selectedType,
      ...(selectedType === "Books"
        ? { title, author, description }
        : {
            name,
            description,
            ...(selectedType === "Classes" && { subject }),
            ...(selectedType === "Live Class" && { link, dateTime }),
            ...(image && { image }),
          }),
    };

    console.log(payload);
    setIsOpen(false);
    resetForm();
  };

  return (
    <div>
      {/* Create Button */}
      <div
        className="flex items-center space-x-3 text-lg px-4 py-2 rounded-md transition-colors text-blue-800 cursor-pointer hover:bg-blue-100"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="w-5 h-5" />
        <span>Create</span>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-full max-w-4xl mx-4 flex">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sidebar Options */}
            <div className="w-1/4 border-r pr-4">
              <h3 className="font-semibold mb-3">Select Type</h3>
              <ul className="space-y-2">
                {types.map((type) => (
                  <li
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`cursor-pointer px-3 py-2 rounded-md ${
                      selectedType === type
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {type}
                  </li>
                ))}
              </ul>
            </div>

            {/* Form Content */}
            <div className="w-3/4 pl-6">
              <h2 className="text-xl font-semibold mb-4">Create {selectedType}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Shared Fields */}
                <>
                {/* Image Upload (shown for all types) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Image
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center justify-center w-28 h-28 border-2 border-dashed rounded-md cursor-pointer text-gray-400 hover:border-blue-400 hover:text-blue-600">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="object-cover w-full h-full rounded-md"
                        />
                      ) : (
                        <ImagePlus className="w-6 h-6" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Conditional Fields */}
                {selectedType === "Books" ? (
                  <>
                    {/* Book Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    {selectedType === "Classes" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {selectedType === "Live Class" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link
                          </label>
                          <input
                            type="url"
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            value={dateTime}
                            onChange={(e) => setDateTime(e.target.value)}
                            required
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </>


                {/* Submit */}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
