// frontend/src/main.tsx
// React DOM entry point. Mounts the App component to #root.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/utils/leafletIconFix"; // Fix Leaflet default marker icons for Vite

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
