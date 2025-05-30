import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import BooksSection from "../components/BooksSection"; // Uses BooksCard internally
export default function Classes() {
    
  const scrollToTop = () => {
    document.querySelector('main')?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
          
          <div className="md:col-span-2">

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

        <button 
          onClick={scrollToTop} 
          className="fixed bottom-6 right-12 p-7 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600">
          ↑
        </button>
      </main>
    </div>
  );
}
