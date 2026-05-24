import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DashboardLayout from "../layouts/DashboardLayout";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import PDFManagement from "../pages/PDFManagement";
import Flashcards from "../pages/Flashcards";
import Quiz from "../pages/Quiz";
import Chat from "../pages/Chat";
import Notes from "../pages/Notes";
import StudyView from "../pages/StudyView";
import Resources from "../pages/Resources";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="pdf" element={<PDFManagement />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="quiz" element={<Quiz />} />
        <Route path="chat" element={<Chat />} />
        <Route path="notes" element={<Notes />} />
        <Route path="resources" element={<Resources />} />
        <Route path="study/:id" element={<StudyView />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;