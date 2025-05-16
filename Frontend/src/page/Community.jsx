import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Cards from "../components/Cards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";



export default function Community() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner name='Find Your Community' Description='Dive into a world of knowledge, stories, and endless possibilities.' />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 space-y-6  p-5 rounded-xl pb-28 pt-0 pl-0">
            
              <Cards name="Community 1" people={100} />
              <Cards name="Community 2" people={100} />
              <Cards name="Community 3" people={100} />
              <Cards name="Community 4" people={100} />
              <Cards name="Community 5" people={100} />
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
  );
}
