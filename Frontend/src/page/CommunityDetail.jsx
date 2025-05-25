import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingScreen from "../components/LoadingScreen"

export default function CommunityDetail() {
  const { slug } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/community/${slug}`);
        setCommunity(res.data);
      } catch (err) {
        console.error("Error fetching community:", err);
        setCommunity({ error: true });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [slug]);

  if (loading) return <LoadingScreen />;
  if (!community || community.error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl font-semibold text-gray-700">
          Community <span className="text-red-500">"{slug}"</span> not found.
        </h1>
      </div>
    );
  }
    const formattedDate = new Date(community.created_at).toLocaleString('en-US', {

    day: 'numeric',
    month: 'short',
    year: 'numeric',
  
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
<section className="relative w-full h-48 md:h-56 lg:h-64 mb-6 rounded-xl overflow-hidden">
  {community.banner_url ? (
    <img
      src={community.banner_url}
      alt={`${community.name} banner`}
      className="absolute inset-0 w-full h-full object-cover"
    />
  ) : (
    <div className="absolute inset-0" />
  )}

  <div className="absolute inset-0 bg-opacity-50 flex items-end justify-between px-6 pb-4">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full overflow-hidden border-4 border-white">
        {community.cover_url ? (
          <img
            src={community.cover_url}
            alt={`${slug} icon`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>
      <h1 className="text-white text-2xl md:text-3xl font-bold bg-black p-1.5 rounded-full ">{community.name}</h1>
    </div>
    <div className="flex gap-2">
      <button className="bg-white text-black font-medium px-4 py-2 rounded hover:bg-gray-100">
        Create Post
      </button>
      <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700">
        Join
      </button>
    </div>
  </div>
</section>



        <div className="flex gap-6 px-4 pb-6">
          {/* Left: Posts */}
          <div className="flex-1 space-y-4">
            <p className="text-sm text-gray-600">{community.description}</p>
            <div className="mt-4 space-y-4">
              {(community.posts || []).map((post, i) => (
                <div key={i} className="p-4 rounded-lg bg-white shadow hover:shadow-md">
                  <p className="text-sm text-gray-500">
                    {post.author} • {post.time}
                  </p>
                  <h2 className="text-lg font-semibold mt-1">{post.title}</h2>
                  <p className="text-sm mt-1">{post.content}</p>

                  <div className="flex gap-4 text-sm text-gray-500 mt-2">
                    <span>👍 {post.votes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Info Card */}
          <div className="w-80 space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">{slug}</h3>
              <p className="text-sm text-gray-600">{community.description}</p>
              <p className="text-sm text-gray-400 mt-2">{community.members || "-"} members</p>
              <p className="text-sm text-gray-400">Created at {formattedDate}</p>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
