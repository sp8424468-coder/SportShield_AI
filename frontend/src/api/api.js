const BASE_URL = "http://127.0.0.1:8000";

// 🔐 Get token
export const getToken = () => localStorage.getItem("token");

// 🔐 Headers
export const authHeaders = () => {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
  };
};

// REGISTER
export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res;
};

// LOGIN
export const loginUser = async (data) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res;
};

// CREATE POST
export const createPost = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/create-post`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  return res;
};

// GET POSTS
export const getPosts = async () => {
  const res = await fetch(`${BASE_URL}/get-posts`, {
    headers: authHeaders(),
  });

  return res;
};