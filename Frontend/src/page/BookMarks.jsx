import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";
import BooksSection from "../components/BooksSection"; // Uses BooksCard internally
import SectionList from "../components/SectionList";

export default function Bookmarks() {

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />

      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />

        <WelcomeBanner
          name="Bookmark"
          Description="Dive into a world of knowledge, stories, and endless possibilities."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Book Section */}
          <div className="md:col-span-3 bg-white ">
            <SectionList title= "Classes" items={['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']}/>
            <SectionList title= "Communities" items={['Community 1', 'Community 2', 'Community 3', 'Community 4', 'Community 5']}/>
            <SectionList title= "Books" items={['Book 1', 'Book 2', 'Book 3', 'Book 4', 'Book 5']}/>
          </div>
        </div>
      </main>
    </div>
  );
}
