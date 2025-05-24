import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CommunityCards from "../components/CommunityCards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";

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
          {loading ? (
            <p className="text-gray-500">Loading communities...</p>
          ) : (
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
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Rightbar
            title="Join The Skills"
            items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]}
          />
          <Rightbar
            title="Ask The Expert"
            items={["Teacher 1", "Teacher 2", "Teacher 3"]}
          />
        </div>
      </div>
    </main>
  </div>
);
}
