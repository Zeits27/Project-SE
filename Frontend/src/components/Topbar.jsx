// src/components/Topbar.jsx
import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthContext";

export default function Topbar() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // <-- global access

  const isLoggedIn = !!user;

  return (
    <div className="flex items-center justify-between p-4 bg-transparent">
      <input
        type="text"
        placeholder="Search..."
        className="w-full max-w-md p-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-50"
      />

      <div className="flex items-center space-x-4 ml-4">
        <Bookmark className="text-blue-600 w-6 h-6" />

        {isLoggedIn ? (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">{user.name}</span>
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </div>
        ) : (
          <div className="relative group">
            <button
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={() => navigate("/login")}
            >
              <span>Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

