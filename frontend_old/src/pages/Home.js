import { useState, useEffect } from "react";
import { createPost, getPosts } from "../api/api";

export default function Home() {
  const [file, setFile] = useState(null);
  const [posts, setPosts] = useState([]);

  const loadPosts = async () => {
    const res = await getPosts();
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    const res = await createPost(file);
    const data = await res.json();

    alert(`Status: ${data.status} | Similarity: ${data.similarity}`);

    loadPosts();
  };

  return (
    <div>
      <h2>Upload Post</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <h2>Feed</h2>
      {posts.map((p) => (
        <div key={p.id}>
          <img src={`http://127.0.0.1:8000/${p.path}`} width="200" />
          <p>Status: {p.status}</p>
        </div>
      ))}
    </div>
  );
}