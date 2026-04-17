import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// TODO: Add your router and root component here.
// See TanStack Router docs: https://tanstack.com/router

function App() {
  return (
    <div>
      <h1>myapp</h1>
      <p>Your React app is running. Start editing src/main.tsx.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
