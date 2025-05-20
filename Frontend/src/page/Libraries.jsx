// pages/Libraries.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import BooksSection from "../components/BooksSection";

export default function Libraries() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/api/books")
      .then((res) => {
        setBooks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading books:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner
          name="Library"
          Description="Dive into a world of knowledge, stories, and endless possibilities."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2">
            {loading ? (
              <p className="text-gray-500">Loading books...</p>
            ) : (
              <BooksSection title="Recommended Books" items={books} />
            )}
          </div>
          <div className="space-y-6">
            <Rightbar title="Join The Skills" items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]} />
            <Rightbar title="Ask The Expert" items={["Teacher 1", "Teacher 2", "Teacher 3"]} />
          </div>
        </div>
      </main>
    </div>
  );
}
