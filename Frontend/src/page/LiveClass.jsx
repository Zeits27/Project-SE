import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import LiveclassSection from "../components/LiveclassSection";
import LoadingScreen from "../components/LoadingScreen";

export default function LiveClass() {
  const { slug } = useParams();
  const [liveClass, setLiveClass] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
  const token = localStorage.getItem("token");
  try {
    const [classRes, recRes] = await Promise.all([
      axios.get(`http://localhost:8080/api/live-class/${slug}`),
      axios.get("http://localhost:8080/api/live-class")
    ]);

    setLiveClass(classRes.data);
    setRecommended(recRes.data);

    if (token) {
      const liveClassId = classRes.data?.id;  // safe optional chaining
      if (liveClassId) {
        try {
          const res = await axios.get("http://localhost:8080/api/bookmark", {
            headers: { Authorization: `Bearer ${token}` }
          });

          const isBookmarked = res.data.some(
            (item) => item.type === "live" && item.id === liveClassId
          );
          setIsBookmarked(isBookmarked);
        } catch (err) {
          console.warn("Could not check bookmark:", err);
        }
      }
    }
  } catch (err) {
    console.error("Error fetching live class detail:", err);
    setLiveClass({ error: true });
  } finally {
    setLoading(false);
  }
};


    fetchData();
  }, [slug]);

  const handleBookmark = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to bookmark.");
      return;
    }

    try {
      if (isBookmarked) {
        await axios.delete("http://localhost:8080/api/bookmark", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            content_type: "live",
            content_id: liveClass.id
          }
        });
        setIsBookmarked(false);
      } else {
        await axios.post(
          "http://localhost:8080/api/bookmark",
          {
            content_type: "live",
            content_id: liveClass.id
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error bookmarking:", error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!liveClass || liveClass.error)
    return <p className="p-6 text-red-600">Live class not found.</p>;

  const formattedDate = new Date(liveClass.date_time).toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 bg-white p-5 rounded-xl pb-28 pt-0 pl-0">
            <div className="flex items-start gap-14 p-6 h-124">
              <div className="w-180 h-full bg-gray-300 rounded-md overflow-hidden">
                <img
                  src={liveClass.image || "/default-image.png"}
                  alt={liveClass.name}
                  onError={(e) => (e.target.src = "/default-image.png")}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between h-full w-full">
                <div className="flex-3/4 overflow-hidden">
                  <h1 className="text-5xl font-bold mb-1">{liveClass.name}</h1>
                  <p className="text-gray-700 mb-1 text-2xl">{formattedDate}</p>
                  <p className="text-gray-600 mb-1">Subject: {liveClass.subject}</p>
                  <p className="text-gray-600 mb-1">
                    Zoom Link:{" "}
                    <a
                      href={liveClass.link}
                      className="text-blue-600 underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {liveClass.link}
                    </a>
                  </p>
                  <p className="text-gray-600 mt-2">{liveClass.description}</p>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={handleBookmark}
                    className="bg-blue-400 text-white px-10 py-5 rounded-md hover:bg-blue-500"
                  >
                    {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pl-4">
              <LiveclassSection title="More Live Classes You May Like" items={recommended} />
            </div>
          </div>

          <div className="space-y-6">
            <Rightbar title="Top Communities" type="community" />
            <Rightbar title="Live Classes" type="liveclass" />
          </div>
        </div>
      </main>
    </div>
  );
}
