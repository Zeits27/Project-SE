import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import BooksSection from "../components/BooksSection";
import LoadingScreen from "../components/LoadingScreen";

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const [bookRes, recRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/books/${slug}`),
          axios.get("http://localhost:8080/api/books")
        ]);

        setBook(bookRes.data);
        setRecommended(recRes.data);

        // Check bookmark status if logged in
        if (token) {
          try {
            const res = await axios.get("http://localhost:8080/api/bookmark", {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            const isBookmarked = res.data.some(
              (item) => item.type === "book" && item.id === bookRes.data.id
            );
            setIsBookmarked(isBookmarked);
          } catch (err) {
            console.warn("Could not check bookmark:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching book detail:", err);
        setBook({ error: true });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleBookmark = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to bookmark.");
      return;
    }

    try {
      if (isBookmarked) {
        await axios.delete("http://localhost:8080/api/bookmark", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            content_type: "book",
            content_id: book.id
          }
        });
        setIsBookmarked(false);
      } else {
        await axios.post(
          "http://localhost:8080/api/bookmark",
          {
            content_type: "book",
            content_id: book.id
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error bookmarking:", error);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!book || book.error)
    return <p className="p-6 text-red-600">Book not found.</p>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 bg-white p-5 rounded-xl pb-28 pt-0 pl-0">
            <div className="flex items-start gap-14 p-6 h-124">
              <div className="w-96 h-full bg-gray-300 rounded-md overflow-hidden">
                <img
                  src={book.image}
                  alt={book.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between h-full w-full">
                <div className="flex-3/4 overflow-hidden">
                  <h1 className="text-6xl font-bold mb-1">{book.title}</h1>
                  <p className="text-gray-700 mb-1 text-3xl">by {book.author}</p>
                  <p className="text-gray-600 mb-1">Subject: {book.subject}</p>
                  <p className="text-gray-600 mb-1 mt-2">{book.description}</p>
                </div>
                <div className="flex gap-3 mt-auto">
                  <a
                    href={book.pdf}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-700 text-white px-10 py-5 rounded-md hover:bg-blue-800 inline-flex items-center justify-center"
                  >
                    Download PDF
                  </a>

                  <button
                    onClick={handleBookmark}
                    className="bg-blue-400 text-white px-10 py-5 rounded-md hover:bg-blue-500"
                  >
                    {isBookmarked ? "Remove Bookmark" : "Bookmark"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pl-4">
              <BooksSection title="Recommended Books" items={recommended} />
            </div>
          </div>
          <div className="space-y-6">
           <Rightbar title="Top Communities" type="community" />
            <Rightbar title="Live Classes" type="liveclass" />
          </div>
        </div>
      </main>
    </div>
  );
}
