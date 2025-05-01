import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CommunityCard from "../components/CommunityCard";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";



export default function Community() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 to-white">
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner name='Find Your Community' Description='Dive into a world of knowledge, stories, and endless possibilities.' />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6">
            <label>FIND YOUR COMMUNITY</label>
            {/* Community Cards Section */}
            
              <CommunityCard name="Community 1" people={100} />
              <CommunityCard name="Community 2" people={100} />
              <CommunityCard name="Community 3" people={100} />
              <CommunityCard name="Community 4" people={100} />
              <CommunityCard name="Community 5" people={100} />
            </div>

            {/* Right Sidebar */}
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
