import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [Name, setName] = useState("");

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    navigate("/set-profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-100">
      <div className="w-full max-w-md p-10 bg-white shadow-xl rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Register</h1>


        <div className="space-y-2">
          <label className="text-base font-medium">Name</label>
          <input
            type="Name"
            placeholder="name"
            className="w-full p-4 text-lg border rounded-lg"
            value={Name}
            onChange={(e) => setName(e.target.value)}

          />
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 text-lg border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-base font-medium">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 text-lg border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white text-lg p-3 rounded-lg hover:bg-blue-700"
        >
          Create Account
        </button>

        {error && <p className="text-red-500 text-base text-center">{error}</p>}

        <button
          onClick={() => navigate("/Login")}
          className="w-full text-base text-blue-600 hover:underline"
        >
        Already have an account? Login
        </button>
      </div>
    </div>
  );
}
