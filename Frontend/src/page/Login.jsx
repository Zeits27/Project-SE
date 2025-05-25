import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../utils/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8080/api/login", {
        email,
        password,
      });

      const { token, name } = response.data;

      // ✅ Save token so AuthContext can load user data
      localStorage.setItem("token", token);

      // ✅ Set user immediately to reflect in Topbar
      setUser({ name, email });

      // ✅ Navigate to home
      navigate("/home");
    } catch (err) {
      const message =
        err.response?.data?.error || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-100">
      <div className="w-full max-w-md p-10 bg-white shadow-xl rounded-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center">Login</h1>

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
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white text-lg p-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {error && <p className="text-red-500 text-base text-center">{error}</p>}

        <div className="flex justify-center mt-4">
          <p className="text-base">
            Don’t have an account? 
          <span
            onClick={() => navigate("/register")}
            className="ml-2 w-full text-base text-blue-600 hover:underline cursor-pointer"
          >
            Register
          </span>
          </p>
        </div>
      </div>
    </div>
  );
}
