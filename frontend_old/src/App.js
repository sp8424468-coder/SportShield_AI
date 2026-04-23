import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));

  if (!loggedIn) {
    return (
      <>
        <Register />
        <Login setLoggedIn={setLoggedIn} />
      </>
    );
  }

  return <Home />;
}

export default App;