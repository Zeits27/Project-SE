import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BooksSection from "../components/BooksSection";
import WelcomeBanner from "../components/WelcomeBanner";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import { AuthContext } from "../utils/AuthContext"; // your context

export default function Bookmarks() {
  const { token } = useContext(AuthContext); // get user token from context

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === null) {
      // token still loading, wait
      return;
    }

    if (!token) {
      setError("You must be logged in to view bookmarks.");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:8080/api/bookmark", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Bookmarks response:", res.data);
        // Filter only book-type bookmarks
        const bookBookmarks = res.data.filter((item) => item.type === "book");
        setBookmarks(bookBookmarks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading bookmarks:", err);
        setError("Failed to load bookmarks.");
        setLoading(false);
      });
  }, [token]);

  if (loading) return <LoadingScreen />;

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />

      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />

        <WelcomeBanner
          name="Bookmarks"
          Description="Dive into a world of knowledge, stories, and endless possibilities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-3 bg-white">
            <BooksSection title="Your Bookmarked Books" items={bookmarks} />
          </div>
        </div>
      </main>
    </div>
  );
}
