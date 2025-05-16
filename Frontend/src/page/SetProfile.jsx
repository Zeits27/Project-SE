import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SetProfile() {
  const navigate = useNavigate();
  const [birthdate, setBirthdate] = useState("");
  const [education, setEducation] = useState("");
  const [region, setRegion] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!birthdate || !education || !region) {
      setError("All fields are required.");
      return;
    }

    setError("");
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-100">
      <div className="w-full max-w-md p-10 bg-white shadow-xl rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Set Up Profile</h1>

        <div className="space-y-2">
          <label className="text-base font-medium">Birthdate</label>
          <input
            type="date"
            className="w-full p-4 text-lg border rounded-lg"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">Education</label>
          <select
            className="w-full p-4 text-lg border rounded-lg"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
          >
            <option value="">Select your education</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor's">Bachelor's Degree</option>
            <option value="Master's">Master's Degree</option>
            <option value="PhD">PhD</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">Region</label>
     
                    <input
            type="Region"
            placeholder="Region"
            className="w-full p-4 text-lg border rounded-lg"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white text-lg p-3 rounded-lg hover:bg-blue-700"
        >
          Continue to Home
        </button>

        {error && <p className="text-red-500 text-base text-center">{error}</p>}
      </div>
    </div>
  );
}
