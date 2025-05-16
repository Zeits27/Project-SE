import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8080/api/register", {
        name,
        email,
        password,
      });

      console.log(response.data.message);
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.error || "Registration failed. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-100">
      <div className="w-full max-w-md p-10 bg-white shadow-xl rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Register</h1>

        <div className="space-y-2">
          <label className="text-base font-medium">Name</label>
          <input
            type="text"
            placeholder="Name"
            className="w-full p-4 text-lg border rounded-lg"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 text-lg border rounded-lg"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 text-lg border rounded-lg"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-600 text-white text-lg p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Registering..." : "Create Account"}
        </button>

        {error && <p className="text-red-500 text-base text-center">{error}</p>}

        <button
          onClick={() => navigate("/login")}
          className="w-full text-base text-blue-600 hover:underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  );
}
