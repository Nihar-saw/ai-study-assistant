import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  BrainCircuit, 
  MessageSquare, 
  Link as LinkIcon,
  StickyNote, 
  LogOut,
  Search,
  Settings,
  Upload
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: FileText, label: "Documents", path: "/pdf" },
    { icon: BookOpen, label: "Flashcards", path: "/flashcards" },
    { icon: BrainCircuit, label: "Quizzes", path: "/quiz" },
    { icon: MessageSquare, label: "AI Chat", path: "/chat" },
    { icon: LinkIcon, label: "Resources", path: "/resources" },
    { icon: StickyNote, label: "Notes", path: "/notes" },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700">
            <BrainCircuit className="text-white" size={20} />
          </div>
          <span className="text-xl font-semibold tracking-tight text-gray-950">StudyAI</span>
        </div>
        <button className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:text-gray-700" title="Collapse sidebar">
          <Settings size={16} />
        </button>
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500" placeholder="Search" />
        </div>
      </div>

      <div className="px-4 pb-3 text-xs font-medium uppercase tracking-wide text-gray-400">Main Menu</div>
      <nav className="flex-grow space-y-1 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? "active" : ""}`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-4 mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-950">Local Model</p>
        <p className="mt-1 text-xs text-blue-700">Ollama powers your PDF tools without API limits.</p>
        <NavLink to="/pdf" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
          <Upload size={14} />
          Add PDF
        </NavLink>
      </div>

      <div className="mx-4 border-t border-gray-100 py-4">
        <button 
          onClick={handleLogout}
          className="sidebar-item w-full text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
