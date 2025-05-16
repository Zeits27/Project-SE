import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Cards from "../components/Cards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import BooksSection from "../components/BooksSection"; // Uses BooksCard internally




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

const items = [
    {
      id: "boat-baby",
      name: "Boat Baby: A Memoir",
      people: 691,
      image: "https://via.placeholder.com/150x220?text=Boat+Baby",
    },
    {
      id: "rebel-romanov",
      name: "The Rebel Romanov",
      people: 402,
      image: "https://via.placeholder.com/150x220?text=Rebel+Romanov",
    },
    // ...more books
  ];
  

export default function BookDetail() {
  const { bookId } = useParams();
  const book = mockData[bookId];

  if (!book) return <p className="p-6 text-red-500">Book not found.</p>;


return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />

      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />

      

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Book Section */}
          {/* <div className="md:col-span-2 bg-white p-5 rounded-xl pb-28 pt-0 pl-0">
             <div className="p-6 max-w-2xl mx-auto bg-white">
                 <img src={book.image} alt={book.name} className="w-48 h-64 rounded-md" />
                <h1 className="text-3xl font-bold mt-4">{book.name}</h1>
                <p className="text-gray-600 mb-2">{book.people} people are reading this.</p>
                <p className="text-gray-800">{book.description}</p> 
                
             </div>
                
          </div> */}
            <div className="md:col-span-2 bg-white p-5 rounded-xl pb-28 pt-0 pl-0">
            <div className="flex items-start gap-14 p-6 h-124">
                {/* Gambar buku */}
                <div className="w-96 h-full bg-gray-300 rounded-md overflow-hidden">
                    {book.image ? (
                    <img src={book.image} alt={book.name} className="w-full h-full object-cover" />
                    ) : null}
                </div>

                {/* Informasi buku - dibagi vertikal */}
                <div className="flex flex-col justify-between h-full w-full">
                    {/* Text info (3/4 tinggi) */}
                    <div className="flex-3/4 overflow-hidden">
                    <h1 className="text-6xl font-bold mb-1">{book.name}</h1>
                    <p className="text-gray-700 mb-1 text-3xl">by {book.author}</p>
                    <p className="text-gray-600 mb-1">Publisher: {book.publisher}</p>
               

                    </div>

                    {/* Tombol aksi (1/4 tinggi) */}
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



                <div className="mt-6 bg">
                    <BooksSection title="Recommended Books" items={items} />
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