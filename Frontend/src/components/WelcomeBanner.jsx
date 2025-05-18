// src/components/WelcomeBanner.jsx
import { useContext } from "react";
import { AuthContext } from "../utils/AuthContext";

export default function WelcomeBanner({Description}) {
  const { user } = useContext(AuthContext); // Get user from auth context

  const isLoggedIn = !!user;

  return (
    <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 rounded-xl mb-6">
      {isLoggedIn ? (
        <>
          <h1 className="text-xl font-bold">Welcome, {user.name}!</h1>
          <p>{Description}</p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold">Welcome!</h1>
          <p>{Description}</p>
        </>
      )}
    </div>
  );
}
