import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import LiveclassSection from "../components/LiveclassSection";

export default function LiveClass() {
  const { slug } = useParams();
  const [liveClass, setLiveClass] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classRes, recRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/live-class/${slug}`),
          axios.get("http://localhost:8080/api/live-class")
        ]);
        setLiveClass(classRes.data);
        setRecommended(recRes.data);
      } catch (err) {
        console.error("Error fetching live class detail:", err);
        setLiveClass({ error: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!liveClass || liveClass.error) return <p className="p-6 text-red-600">Live class not found.</p>;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image */}
              <div className="md:w-1/3 h-64 md:h-auto bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={liveClass.image || "/default-image.png"}
                  onError={(e) => (e.target.src = "/default-image.png")}
                  alt={liveClass.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-3">
                <h1 className="text-4xl font-bold text-gray-900">{liveClass.name}</h1>
                <p className="text-gray-600 text-lg">📅 {formattedDate}</p>
                <p className="text-gray-700 text-lg">🎓 Subject: <span className="font-medium">{liveClass.subject}</span></p>
                <p className="text-gray-800 text-lg">
                  🔗 Zoom Link:{" "}
                  <a
                    href={liveClass.link}
                    className="text-blue-600 underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {liveClass.link}
                  </a>
                </p>
                <p className="text-gray-700 mt-2">📝 Description: {liveClass.description}</p>
              </div>
            </div>

            {/* Recommended Live Classes */}
            <div className="mt-10">
              <LiveclassSection title="More Live Classes You May Like" items={recommended} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Rightbar title="Join The Skills" items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]} />
            <Rightbar title="Ask The Expert" items={["Teacher 1", "Teacher 2", "Teacher 3"]} />
          </div>
        </div>
      </main>
    </div>
  );
}
