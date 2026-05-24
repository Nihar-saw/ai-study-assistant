import { AuthProvider } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <AppRoutes />
      </StudyProvider>
    </AuthProvider>
  );
}

export default App;