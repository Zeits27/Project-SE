import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../utils/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WelcomeBanner from "../components/WelcomeBanner";
import Rightbar from "../components/Rightbar";
import Footer from "../components/Footer";
import BooksSection from "../components/BooksSection";
import LiveclassSection from "../components/LiveclassSection";
import CommunitySection from "../components/CommunitySection";
import axios from "axios";

export default function Home() {
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!user;

  const [books, setBooks] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const [communities, setCommunities] = useState([]);

  const scrollToTop = () => {
    document.querySelector("main")?.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/home");
        setBooks(res.data.books || []);
        setLiveClasses(res.data.live_classes || []);
        setCommunities(res.data.communities || []);
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-b from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner
          name={isLoggedIn ? `Welcome! ${user.name}` : "Welcome!"}
          Description="Dive into a world of knowledge, stories, and endless possibilities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Main Content */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md space-y-10">
            <div className="flex items-center gap-6 p-4 transition mb-4">
                <BooksSection title="Recent Books" items={books} />
            </div>
            <div className="flex items-center gap-6  pt-4 pb-4  mb-4">
                <LiveclassSection title="Up comming Live Classes" items={liveClasses} />
            </div>
            <div className="flex items-center gap-6  pt-4 pb-4  ">
              <CommunitySection title="Top Communities" items={communities} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Rightbar title="Top Communities" type="community" />
            <Rightbar title="Live Classes" type="liveclass" />
          </div>
        </div>

        {/* Scroll to top button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-12 p-5 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
        >
          ↑
        </button>

        <div className="mt-10">
          <Footer />
        </div>
      </main>
    </div>
  );
}

//  <div className="flex items-center gap-6 bg-white p-4 rounded-xl shadow hover:shadow-md transition mb-4">
//               <BooksSection title="Top Books" items={books} />
//           </div>
//           <div className="flex items-center gap-6 bg-white pt-4 pb-4 rounded-xl shadow hover:shadow-md transition mb-4">
//               <LiveclassSection title="Up comming Live Classes" items={liveClasses} />
//           </div>

//            <div className="flex items-center gap-6 bg-white pt-4 pb-4 rounded-xl shadow hover:shadow-md transition">
//              <CommunitySection title="Top Communities" items={communities} />
//           </div>