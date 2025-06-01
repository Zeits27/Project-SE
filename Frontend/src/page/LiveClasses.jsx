import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LiveClassCards from "../components/LiveClassCards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import { RouteGuard } from "../utils/RouteGuard";
import { useEffect, useState } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";


export default function LiveClasses() {

  const [liveclass, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/live-class")
      .then((res) => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading  Live Classes:", err);
        setLoading(false);
      });
  }, []);

  const scrollToTop = () => {
    document.querySelector('main')?.scrollTo({
    top: 0,
    behavior: 'smooth'
    });
  };

  if (loading) return <LoadingScreen />;

    // RouteGuard();
  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner name='Live Classes' Description='Dive into a world of knowledge, stories, and endless possibilities.' />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6  p-5 rounded-xl pb-28 pt-0 pl-0">

           {liveclass.map((livecalsss) => (
                  <LiveClassCards
                    key={livecalsss._id}
                    image={livecalsss.image}
                    name={livecalsss.name}
                    subject={livecalsss.subject}
                    description={livecalsss.description}
                    date={livecalsss.date_time}
                    slug={livecalsss.slug}
                  />
                ))               
              }
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
             <Rightbar title="Top Communities" type="community" />
                <Rightbar title="Live Classes" type="liveclass" />
                
            </div>
        </div>

        <button 
          onClick={scrollToTop} 
          className="fixed bottom-6 right-12 p-7 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600">
          ↑
        </button>
        </main>
    </div>
  );
}
