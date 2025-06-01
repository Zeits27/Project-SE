import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import LoadingScreen from "../components/LoadingScreen";

export default function CommunityDetail() {
  const { slug } = useParams();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    const fetchCommunity = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(`http://localhost:8080/api/community/${slug}`);
        const communityData = res.data;

        let posts = [];
        try {
          const postRes = await axios.get(`http://localhost:8080/api/community/${slug}/posts`);
          posts = postRes.data;
        } catch (err) {
          console.error("Error fetching community posts:", err);
        }

        setCommunity({ ...communityData, posts });

        if (token && communityData?.id) {
          const bookmarkRes = await axios.get("http://localhost:8080/api/bookmark", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const bookmarked = bookmarkRes.data.some(
            (item) => item.type === "community" && item.id === communityData.id
          );
          setIsBookmarked(bookmarked);
        }
      } catch (err) {
        console.error("Error fetching community:", err);
        setCommunity({ error: true });
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [slug]);

  const handleBookmark = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to join/bookmark a community.");
      return;
    }

    try {
      if (isBookmarked) {
        await axios.delete("http://localhost:8080/api/bookmark", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            content_type: "community",
            content_id: community.id,
          },
        });
        setIsBookmarked(false);
      } else {
        await axios.post(
          "http://localhost:8080/api/bookmark",
          {
            content_type: "community",
            content_id: community.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error toggling community bookmark:", error);
    }
  };

  const handleNewPost = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to post.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:8080/api/community/${slug}/post`,
        newPost,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommunity((prev) => ({
        ...prev,
        posts: [res.data, ...(prev.posts || [])],
      }));
      setNewPost({ title: "", content: "" });
      setShowPostForm(false);
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  const handleReply = async (postId) => {
    const token = localStorage.getItem("token");
    const content = replyInputs[postId];
    if (!token || !content) return;

    try {
      const res = await axios.post(
        `http://localhost:8080/api/community/${slug}/post/${postId}/reply`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCommunity((prev) => ({
        ...prev,
        posts: prev.posts.map((post) =>
          post.id === postId || post.post_id === postId
            ? { ...post, replies: [...(post.replies || []), res.data] }
            : post
        ),
      }));

      setReplyInputs({ ...replyInputs, [postId]: "" });
    } catch (err) {
      console.error("Error replying to post:", err);
    }
  };

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

  // const formattedDate = new Date(community.created_at).toLocaleString("en-US", {
  //   day: "numeric",
  //   month: "short",
  //   year: "numeric",
  // });

  return (
    <div className="flex h-screen bg-gradient-to-br from-white to-blue-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />

        <section className="relative w-full h-48 md:h-56 lg:h-64 mb-6 overflow-hidden">
          {community.banner_url ? (
            <img
              src={community.banner_url}
              alt={`${community.name} banner`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-yellow-400" />
          )}

          <div className="absolute bottom-0 left-0 w-full px-6 py-4 bg-white/80 backdrop-blur-md shadow-lg rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full overflow-hidden border-4 border-white shadow-md">
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
              <h1 className="text-black text-2xl md:text-3xl font-bold">{community.name}</h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPostForm((prev) => !prev)}
                className="bg-gray-100 text-black font-medium px-4 py-2 rounded hover:bg-gray-200 shadow"
              >
                {showPostForm ? "Cancel" : "Create Post"}
              </button>
              <button
                onClick={handleBookmark}
                className="bg-blue-400 text-white px-10 py-5 rounded-md hover:bg-blue-500"
              >
                {isBookmarked ? "Leave community" : "Join"}
              </button>
            </div>
          </div>
        </section>

        <div className="flex gap-6 px-4 pb-6">
          <div className="flex-1 space-y-4">
            <p className="text-sm text-gray-600">{community.description}</p>

            {showPostForm && (
              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="font-semibold mb-2">Create a New Post</h2>
                <input
                  type="text"
                  placeholder="Title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
                <textarea
                  placeholder="Content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full border px-3 py-2 rounded mb-2"
                />
                <button
                  onClick={handleNewPost}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Post
                </button>
              </div>
            )}

            {(community.posts || []).map((post, index) => {
              const postKey = post.id || post.post_id || `fallback-${index}`;
              return (
                <div key={postKey} className="bg-white p-4 rounded shadow">
                  <h3 className="text-lg font-semibold">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">By {post.author}</p>
                  <p className="mb-2">{post.content}</p>
                  <div className="mt-2">
                    <textarea
                      placeholder="Reply..."
                      value={replyInputs[postKey] || ""}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [postKey]: e.target.value })}
                      className="w-full border px-2 py-1 rounded"
                    />
                    <button
                      onClick={() => handleReply(postKey)}
                      className="mt-1 px-3 py-1 bg-blue-400 text-white rounded hover:bg-blue-500"
                    >
                      Reply
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {(post.replies || []).map((reply) => (
                      <div key={reply.id} className="text-sm border-t pt-2">
                        <p className="font-semibold">{reply.author}</p>
                        <p>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
