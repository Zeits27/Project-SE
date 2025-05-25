import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LiveClassCards from "../components/LiveClassCards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import { RouteGuard } from "../utils/RouteGuard";
import { useEffect, useState } from "react";
import axios from "axios";


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

    // RouteGuard();
  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner name='Live Classes' Description='Dive into a world of knowledge, stories, and endless possibilities.' />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6  p-5 rounded-xl pb-28 pt-0 pl-0">
              {loading ? (
              <p className="text-gray-500">Loading Live Classes...</p>
              ) : (
                liveclass.map((livecalsss) => (
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
