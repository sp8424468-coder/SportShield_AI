import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState(null);

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

  const loadProfile = async () => {
    try {
      const userId = getUserId();
      const token = localStorage.getItem("token");

      const res = await fetch(`http://127.0.0.1:8000/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      setProfile({
        username: data.username || "User",
        age: data.age || "N/A",
        total_posts: data.total_posts || 0,
        posts: data.posts || []
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* 🔝 TOP BAR */}
      <div className="border-b p-4 text-center font-semibold text-lg">
        {profile.username}
      </div>

      {/* 👤 PROFILE HEADER */}
      <div className="p-6 flex items-center gap-6">

        {/* Profile Pic */}
        <div className="w-24 h-24 rounded-full border-2 border-pink-500 flex items-center justify-center text-2xl font-bold">
          {profile.username.charAt(0).toUpperCase()}
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-center">
          <div>
            <p className="font-bold text-lg">{profile.total_posts}</p>
            <p className="text-gray-500 text-sm">Posts</p>
          </div>
          <div>
            <p className="font-bold text-lg">0</p>
            <p className="text-gray-500 text-sm">Followers</p>
          </div>
          <div>
            <p className="font-bold text-lg">0</p>
            <p className="text-gray-500 text-sm">Following</p>
          </div>
        </div>

      </div>

      {/* 📄 BIO */}
      <div className="px-6 pb-4">
        <p className="font-semibold">{profile.username}</p>
        <p className="text-gray-600 text-sm">Age: {profile.age}</p>
        <p className="text-gray-500 text-sm">
          AI Protected Content Creator 🚀
        </p>
      </div>

      {/* 🔘 ACTION BUTTONS */}
      <div className="flex gap-3 px-6 mb-4">
        <button className="flex-1 bg-blue-500 text-white py-1 rounded">
          Edit Profile
        </button>
        <button className="flex-1 border py-1 rounded">
          Share
        </button>
      </div>

      {/* 📌 TABS */}
      <div className="border-t flex justify-around py-2 text-gray-600">
        <span className="font-semibold">📷 Posts</span>
        <span>🎞️ Reels</span>
        <span>🔖 Saved</span>
      </div>

      {/* 📸 GRID */}
      <div className="grid grid-cols-3 gap-[2px]">

        {profile.posts.length === 0 ? (
          <p className="col-span-3 text-center text-gray-400 mt-10">
            No posts yet
          </p>
        ) : (
          profile.posts.map((p) => (
            <img
              key={p.id}
              src={`http://127.0.0.1:8000/${p.path}`}
              className="w-full h-32 object-cover"
              alt=""
            />
          ))
        )}

      </div>

    </div>
  );
}