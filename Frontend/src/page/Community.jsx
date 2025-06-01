import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CommunityCards from "../components/CommunityCards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import LoadingScreen from "../components/LoadingScreen";

export default function Community() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);   // state loading
  // const [error, setError] = useState(null);       // state error optional

   useEffect(() => {
    axios.get("http://localhost:8080/api/community")
      .then((res) => {
        setCommunities(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading community:", err);
        setLoading(false);
      });
  }, [])

  const scrollToTop = () => {
    document.querySelector('main')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) return <LoadingScreen />;

  return (
  <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
    <Sidebar />
    <main className="flex-1 p-4 overflow-y-auto">
      <Topbar />
      <WelcomeBanner
        name="Find Your Community"
        Description="Dive into a world of knowledge, stories, and endless possibilities."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.map((community) => (
                <CommunityCards
                  key={community.id}
                  name={community.name}
                  people="111"
                  description={community.description}
                  image={community.cover_url}
                  slug={community.slug}
                />
              ))}
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
          className="fixed bottom-6 right-12 p-7 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600">
          ↑
        </button>
    </main>
  </div>
);
}
