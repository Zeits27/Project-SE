import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import BooksSection from "../components/BooksSection";
import CommunitySection from "../components/CommunitySection";
import LiveclassSection from "../components/LiveclassSection";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";

export default function ClassesDetail() {
  const { slug } = useParams();
  const [bookItems, setBookItems] = useState([]);
  const [liveItems, setLiveItems] = useState([]);
  const [communityItems, setCommunityItems] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  const scrollToTop = () => {
    document.querySelector("main")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/class/${slug}`);
        const allItems = [
          ...(res.data.books || []),
          ...(res.data.live_classes || []),
          ...(res.data.communities || []),
        ];

        setBookItems(allItems.filter((item) => item.type === "book"));
        setLiveItems(allItems.filter((item) => item.type === "live"));
        setCommunityItems(allItems.filter((item) => item.type === "community"));
        setClassName(res.data.name);
      } catch (err) {
        console.error("Error fetching class detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [slug]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />

      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />

        <WelcomeBanner
          name={`${className}`}
          Description={`Dive into everything about ${className}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-6 bg-white p-4 rounded-xl shadow hover:shadow-md transition mb-4">

            {bookItems.length > 0 ? (
              <BooksSection title="Books" items={bookItems} />
            ) : (
              <div className="text-center text-gray-500 text-lg py-12 pl-5">
                No books found for this class.
              </div>
            )}
            </div>
             <div className="flex items-center gap-6 bg-white pt-4 pb-4 rounded-xl shadow hover:shadow-md transition mb-4">

            {liveItems.length > 0 ? (
              <LiveclassSection title="Live Classes" items={liveItems} />
            ) : (
              <div className="text-center text-gray-500 text-lg py-12 pl-5 ">
                No live classes found for this class.
              </div>
            )}
            </div>
            <div className="flex items-center gap-6 bg-white pt-4 pb-4 rounded-xl shadow hover:shadow-md transition">
            {communityItems.length > 0 ? (
              <CommunitySection title="Communities" items={communityItems} />
            ) : (
              <div className="text-center text-gray-500 text-lg py-12 pl-5">
                No communities found for this class.
              </div>
            )}
          </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Rightbar title="Top Communities" type="community" />
            <Rightbar title="Live Classes" type="liveclass" />
          </div>
        </div>

        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-12 p-7 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
        >
          ↑
        </button>
      </main>
    </div>
  );
}
