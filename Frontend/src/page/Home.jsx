import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import WelcomeBanner from "../components/WelcomeBanner";
import SectionList from "../components/SectionList";
import Rightbar from "../components/Rightbar";

export default function Home() {
  
  
  
  return (
    <div className="flex h-screen bg-gradient-to-b from-white to-blue-100">
      <Sidebar /> 
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />

        <WelcomeBanner 
          name="Welcome!  "
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
        </div>
      </main>
    </div>
  );
}
