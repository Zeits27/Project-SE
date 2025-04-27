import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import WelcomeBanner from "./components/WelcomeBanner";
import SectionList from "./components/SectionList";
import CommunityWidget from "./components/CommunityWidget";

export default function App() {
  return (
    <div className="flex h-screen bg-gradient-to-b from-white to-blue-100">
      <Sidebar /> 
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6">
            <SectionList title="Popular" />
            <SectionList title="On Going" />
            <SectionList title="Classes" subtitle="Explore engaging topics" />
            <SectionList title="Ask The Expert" />
          </div>
          <div className="space-y-6">
            <CommunityWidget
              title="Join The Community"
              items={["Community 1", "Community 2", "Community 3"]}
            />
            <CommunityWidget
              title="Upgrade Your Skills"
              items={["Live Classes 1", "Live Classes 2", "Live Classes 3"]}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
