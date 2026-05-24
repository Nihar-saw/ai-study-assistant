import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StudyProvider>
          <AppRoutes />
        </StudyProvider>
      </AuthProvider>
      <Toaster position="top-right" />
    </BrowserRouter>
  </React.StrictMode>
);