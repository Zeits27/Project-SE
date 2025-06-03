import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import LoadingScreen from "../components/LoadingScreen";
import ClassCards from "../components/ClassCards";

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/class")
      .then((res) => {
        setClasses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading classes:", err);
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner
          name="Explore Classes"
          Description="Choose a subject and dive into related communities and learning materials."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {classes.map((cls) => (
                  <ClassCards
                    key={cls.id}
                    name={cls.name}
                    slug={cls.slug}
                    image={cls.img_url}
                  />
                ))}
            </div>
          </div>

          <div className="space-y-6">
            <Rightbar title="Top Classes" type="class" />
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
