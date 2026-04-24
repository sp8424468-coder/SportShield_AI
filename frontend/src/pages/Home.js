import { useState, useEffect } from "react";
import { createPost, getPosts } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  const getUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch {
      return null;
    }
  };

  const loadPosts = async () => {
    try {
      const res = await getPosts();

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.reload();
        return;
      }

      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const res = await createPost(file);
    const data = await res.json();

    alert(`Status: ${data.status}`);
    loadPosts();
  };

  const handleLike = async (postId) => {
    const userId = getUserId();
    const token = localStorage.getItem("token");

    await fetch(`http://127.0.0.1:8000/like/${postId}?user_id=${userId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadPosts();
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* 🔵 SIDEBAR */}
      <div className="w-64 bg-white shadow-md p-5 hidden md:block">

        <h1 className="text-xl font-bold text-blue-600 mb-6">
          SportShield AI
        </h1>

        <ul className="space-y-4 text-gray-700">
          <li className="font-semibold text-blue-600">🏠 Home</li>
          <li className="cursor-pointer" onClick={() => navigate("/profile")}>👤 Profile</li>
          <li>📁 My Posts</li>
          <li>❤️ Liked Posts</li>
          <li>⚙️ Settings</li>
        </ul>

        {/* Extra Card */}
        <div className="mt-10 p-4 bg-blue-50 rounded-xl text-sm">
          <h3 className="font-semibold mb-2">🛡️ Stay Safe Online</h3>
          <p className="text-gray-500">
            Our AI works 24/7 to keep harmful and duplicate content away.
          </p>
        </div>

      </div>

      {/* 🟣 MAIN CONTENT */}
      <div className="flex-1 flex flex-col">

        {/* 🔝 TOPBAR */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 flex justify-between items-center shadow">

          <input
            placeholder="Search posts..."
            className="px-4 py-1 rounded-full text-black w-64 outline-none"
          />

          <div className="flex items-center gap-4">
            <span>👤 sagar</span>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="bg-red-500 px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>

        </div>

        {/* 📄 CONTENT AREA */}
        <div className="p-6 overflow-y-auto">

          {/* 📤 Upload Box */}
          <div className="bg-white p-6 rounded-xl shadow mb-6">

            <h2 className="font-semibold mb-3">Create Post</h2>

            <div className="border-2 border-dashed p-6 text-center rounded-lg">
              <p className="text-gray-500 mb-2">
                Click to upload or drag image
              </p>

              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-3"
              />

              <button
                onClick={handleUpload}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Upload
              </button>
            </div>
          </div>

          {/* 📰 POSTS */}
          <div className="space-y-6 max-w-2xl mx-auto">

            {posts.map((p) => {
              const userId = getUserId();
              const isLiked = p.likes?.includes(userId);

              return (
                <div key={p.id} className="bg-white rounded-xl shadow">

                  {/* Header */}
                  <div className="p-4 flex justify-between items-center">
                    <div className="font-semibold">
                      👤 {p.username || "User"}
                    </div>
                    <span className="text-sm text-gray-400">just now</span>
                  </div>

                  {/* Image */}
                  <img
                    src={`http://127.0.0.1:8000/${p.path}`}
                    className="w-full rounded"
                    alt=""
                  />

                  {/* Actions */}
                  <div className="p-4">

                    <button
                      onClick={() => handleLike(p.id)}
                      className={`text-xl ${isLiked ? "text-red-500" : "text-gray-400"}`}
                    >
                      ❤️ {p.likes?.length || 0}
                    </button>

                    {/* Status Badge */}
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                      p.status === "safe"
                        ? "bg-green-100 text-green-600"
                        : p.status === "suspicious"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {p.status}
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </div>
      </div>

    </div>
  );
}