import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WelcomeBanner from "../components/WelcomeBanner";
import SectionList from "../components/SectionList";
import Rightbar from "../components/Rightbar";
import { useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import Footer from "../components/Footer";

export default function Home() {
    const { user } = useContext(AuthContext); // Get user from auth context
  
    const isLoggedIn = !!user;

    const scrollToTop = () => {
      document.querySelector('main')?.scrollTo({
      top: 0,
      behavior: 'smooth'
      });
    };
  
  
  return (
    <div className="flex h-screen bg-gradient-to-b from-white to-blue-100">
      <Sidebar /> 
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
          <WelcomeBanner
            name={isLoggedIn ? `Welcome! ${user.name}` : "Welcome!"}
            Description="Dive into a world of knowledge, stories, and endless possibilities."
          />

       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6 p-5 rounded-xl pb-28 pl-0 bg-white shadow-xl">
            <SectionList title="Popular" items={["Classes 1", "Classes 2", "Live Classes 3"]} />
            <SectionList title="On Going" items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]} />
            <SectionList title="Classes" items={["Classes 1", "Classes 2", "Live Classes 3"]} />
            <SectionList title="Ask The Expert" items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]} />
          </div>
          <div className="space-y-6">
            <Rightbar
              title="Join The Community"
              items={["Community 1", "Community 2", "Community 3"]}
            />
            <Rightbar
              title="Upgrade Your Skills"
              items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]}
            />
          </div>

          <button 
          onClick={scrollToTop} 
          className="fixed bottom-6 right-12 p-7 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600">
          ↑
        </button>
        </div>
        <Footer/>

      </main>
      
    </div>
    
  );
}
