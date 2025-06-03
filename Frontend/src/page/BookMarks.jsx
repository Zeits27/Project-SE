import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import BooksSection from "../components/BooksSection"; // for books
import LiveClassSection from "../components/LiveclassSection"; // for live classes
import WelcomeBanner from "../components/WelcomeBanner";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import { AuthContext } from "../utils/AuthContext";
import CommunitySection from "../components/CommunitySection"; // for communities

export default function Bookmarks() {
  const { token } = useContext(AuthContext);

  const [bookmarks, setBookmarks] = useState([]);
  const [liveBookmarks, setLiveBookmarks] = useState([]);
  const [communityBookmarks, setCommunityBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token === null) return;

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
        const bookBookmarks = res.data.filter((item) => item.type === "book");
        const liveBookmarks = res.data.filter((item) => item.type === "live");
        const communityBookmarks = res.data.filter((item) => item.type === "community");

        setBookmarks(bookBookmarks);
        setLiveBookmarks(liveBookmarks);
        setCommunityBookmarks(communityBookmarks);
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
      <main className="flex-1 flex flex-col">
        <Topbar />

        <div className="flex-1 overflow-y-auto rounded-t-3xl shadow-md px-6 py-6">
          <WelcomeBanner
            name="Bookmarks"
            Description="Dive into a world of knowledge, stories, and endless possibilities."
          />
        
          <div className="flex items-center gap-6 bg-white p-4 rounded-xl shadow hover:shadow-md transition mb-4">
            {bookmarks.length > 0 ? (
              <BooksSection title="Your Bookmarked Books" items={bookmarks} />
            ) : (
              <div className="text-center text-gray-500 text-lg py-12">
                You haven’t bookmarked any books yet. <br />
                <span className="text-sm text-gray-400">
                  Start exploring and add your favorites.
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 bg-white pt-4 pb-4 rounded-xl shadow hover:shadow-md transition mb-4">
            {liveBookmarks.length > 0 ? (
              <LiveClassSection
                title="Your Bookmarked Live Classes"
                items={liveBookmarks}
              />
            ) : (
              <div className="text-center text-gray-500 text-lg py-12">
                You haven’t bookmarked any live classes yet. <br />
                <span className="text-sm text-gray-400">
                  Browse live classes and bookmark your favorites.
                </span>
              </div>
            )}
          </div>

           <div className="flex items-center gap-6 bg-white pt-4 pb-4 rounded-xl shadow hover:shadow-md transition">
            {communityBookmarks.length > 0 ? (
              <CommunitySection
                title="Your joined Communities"
                items={communityBookmarks}
              />
            ) : (
              <div className="text-center text-gray-500 text-lg py-12">
                You haven’t join any communities yet. <br />
                <span className="text-sm text-gray-400">
                  Browse live classes and bookmark your favorites.
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
