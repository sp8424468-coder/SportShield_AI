const BASE_URL = "http://127.0.0.1:8000";

// 🔐 Get token
export const getToken = () => localStorage.getItem("token");

// 🔐 Headers
export const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

// REGISTER
export const registerUser = async (data) => {
  return fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

// LOGIN
export const loginUser = async (data) => {
  return fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
};

// CREATE POST
export const createPost = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`${BASE_URL}/create-post`, {
    method: "POST",
    headers: authHeaders(),
    body: formData
  });
};

// GET POSTS
export const getPosts = async () => {
  return fetch(`${BASE_URL}/get-posts`, {
    headers: authHeaders()
  });
};