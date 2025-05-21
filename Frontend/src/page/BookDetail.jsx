// pages/BookDetail.jsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import BooksSection from "../components/BooksSection";

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, recRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/books/${slug}`),
          axios.get("http://localhost:8080/api/books")
        ]);
        setBook(bookRes.data);
        setRecommended(recRes.data);
      } catch (err) {
        console.error("Error fetching book detail:", err);
        setBook({ error: true });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!book || book.error) return <p className="p-6 text-red-600">Book not found.</p>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 bg-white p-5 rounded-xl pb-28 pt-0 pl-0">
            <div className="flex items-start gap-14 p-6 h-124">
              <div className="w-96 h-full bg-gray-300 rounded-md overflow-hidden">
                <img src={book.image} alt={book.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-between h-full w-full">
                <div className="flex-3/4 overflow-hidden">
                  <h1 className="text-6xl font-bold mb-1">{book.name}</h1>
                  <p className="text-gray-700 mb-1 text-3xl">by {book.author}</p>
                  <p className="text-gray-600 mb-1">Subject: {book.subject}</p>
                  <p className="text-gray-600 mb-1 mt-2">{book.description}</p>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button className="bg-blue-700 text-white px-10 py-5 rounded-md hover:bg-blue-800">
                    Download PDF
                  </button>
                  <button className="bg-blue-400 text-white px-10 py-5 rounded-md hover:bg-blue-500">
                    Open in Web
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <BooksSection title="Recommended Books" items={recommended} />
            </div>
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
