import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Cards from "../components/Cards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";




const mockData = {
  "boat-baby": {
    name: "Boat Baby: A Memoir",
    people: 691,
    description: "A powerful memoir about life on the water.",
    image: "https://via.placeholder.com/150x220?text=Boat+Baby",
  },
  "rebel-romanov": {
    name: "The Rebel Romanov",
    people: 402,
    description: "A fictional retelling of a royal rebellion.",
    image: "https://via.placeholder.com/150x220?text=Rebel+Romanov",
  },
  // add more books
};

export default function BookDetail() {
  const { bookId } = useParams();
  const book = mockData[bookId];

  if (!book) return <p className="p-6 text-red-500">Book not found.</p>;


return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />

      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />

        <WelcomeBanner
          name="Classes"
          Description="Dive into a world of knowledge, stories, and endless possibilities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Book Section */}
          <div className="md:col-span-2">
          <div className="p-6 max-w-2xl mx-auto">
                <img src={book.image} alt={book.name} className="w-48 h-auto rounded" />
                <h1 className="text-3xl font-bold mt-4">{book.name}</h1>
                <p className="text-gray-600 mb-2">{book.people} people are reading this.</p>
                <p className="text-gray-800">{book.description}</p>
                </div>
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
  );}