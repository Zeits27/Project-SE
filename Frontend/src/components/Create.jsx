import { useState } from "react";
import { Plus, X, ImagePlus } from "lucide-react";

// Import sub-form components
import BookForm from "./createForms/BookForm";
import CommunityForm from "./createForms/CommunityForm";
import ClassesForm from "./createForms/ClassesForm";
import LiveClassForm from "./createForms/LiveClassForm";


const types = ["Community", "Classes", "Live Class", "Books"];

export default function Create() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("Community");
  const [image, setImage] = useState(null);
  // const [preview, setPreview] = useState(null);

  // Shared form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [link, setLink] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const resetForm = () => {
    setImage(null);

    setName("");
    setDescription("");
    setSubject("");
    setLink("");
    setDateTime("");
    setTitle("");
    setAuthor("");
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

    console.log("Submitting:", payload);
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
          <div className="bg-white w-full max-w-6xl h-[750px] rounded-lg shadow-lg relative mx-4 flex overflow-hidden">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 z-10"
              onClick={() => {
                setIsOpen(false);
                resetForm();
              }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <div className="w-1/4 border-r px-4 py-6">
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
            <div className="w-3/4 px-6 py-6 overflow-y-auto">

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Conditional Forms */}
                {selectedType === "Books" && (
                  <BookForm
                    title={title}
                    author={author}
                    description={description}
                    setTitle={setTitle}
                    setAuthor={setAuthor}
                    setDescription={setDescription}
                  />
                )}

                {selectedType === "Community" && (
                  <CommunityForm
                    name={name}
                    description={description}
                    setName={setName}
                    setDescription={setDescription}
                  />
                )}

                {selectedType === "Classes" && (
                  <ClassesForm
                    name={name}
                    subject={subject}
                    description={description}
                    setName={setName}
                    setSubject={setSubject}
                    setDescription={setDescription}
                  />
                )}

                {selectedType === "Live Class" && (
                  <LiveClassForm
                    name={name}
                    description={description}
                    link={link}
                    dateTime={dateTime}
                    setName={setName}
                    setDescription={setDescription}
                    setLink={setLink}
                    setDateTime={setDateTime}
                  />
                )}


              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}