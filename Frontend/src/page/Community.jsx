import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import CommunityCards from "../components/CommunityCards";
import Rightbar from "../components/Rightbar";
import WelcomeBanner from "../components/WelcomeBanner";



export default function Community() {
  const communities = [
    {
      name: "Starfield",
      people: "914K",
      description: "Participate in discussions about Bethesda's space RPG, Starfield.",
      image: "/images/starfield.jpg",
    },
    {
      name: "apexlegends",
      people: "3M",
      description: "Share your favorite game clips, funny moments, and insights about Apex Legends.",
      image: "/images/apex.jpg",
    },
    {
      name: "mildlyinteresting",
      people: "25M",
      description: "Appreciate the small things in life that are just a little bit interesting.",
      image: "/images/mildly.jpg",
    },
    {
      name: "marvelmemes",
      people: "4.3M",
      description: "Get your daily dose of superhero humor with the latest Marvel memes!",
      image: "/images/marvel.jpg",
    },
    {
      name: "popculturechat",
      people: "5.4M",
      description: "Dive into discussions about movies, music, celebrity gossip, and more.",
      image: "/images/popculture.jpg",
    },
    {
      name: "BaldursGate3",
      people: "3.2M",
      description: "Gather your party and enter the world of Baldur’s Gate III with this community.",
      image: "/images/baldur.jpg",
    },
  ];

  
  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      
      <Sidebar />
      <main className="flex-1 p-4 overflow-y-auto">
        <Topbar />
        <WelcomeBanner name='Find Your Community' Description='Dive into a world of knowledge, stories, and endless possibilities.' />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communities.map((community, index) => (
              <CommunityCards
                key={index}
                name={community.name}
                people={community.people}
                description={community.description}
                image={community.image}
              />
            ))}
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
  );
}
