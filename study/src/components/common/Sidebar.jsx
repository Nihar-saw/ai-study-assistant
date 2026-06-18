import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API from "../../api/axios";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleOpenProfileModal = async () => {
    setShowProfileModal(true);
    setModalLoading(true);
    try {
      const { data } = await API.get("/auth/profile");
      setProfileData(data);
    } catch (err) {
      console.error("Error loading profile details", err);
    } finally {
      setModalLoading(false);
    }
  };

  const menuItems = [
    { iconName: "dashboard", label: "Dashboard", path: "/dashboard" },
    { iconName: "folder_open", label: "Documents", path: "/pdf" },
    { iconName: "library_books", label: "Resources", path: "/resources" },
    { iconName: "chat", label: "AI Chat", path: "/chat" },
    { iconName: "quiz", label: "Quizzes", path: "/quiz" },
    { iconName: "style", label: "Flashcards", path: "/flashcards" },
    { iconName: "route", label: "AI Roadmap", path: "/roadmap" },
    { iconName: "calendar_today", label: "Study Planner", path: "/planner" },
    { iconName: "workspace_premium", label: "Exam Prep", path: "/exam-prep" },
    { iconName: "analytics", label: "Weakness & Analytics", path: "/analytics" },
    { iconName: "history", label: "Revision Queue", path: "/revision" },
    { iconName: "edit_note", label: "Notes", path: "/notes" },
  ];

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white p-5 justify-between">
      <div>
        {/* Brand Logo Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
          <div className="text-left">
            <h1 className="font-display-lg text-[22px] leading-tight font-bold text-primary">Lumina AI</h1>
            <p className="font-label-md text-on-surface-variant text-[11px] font-semibold">Premium Study Assistant</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[55vh] pr-1 scroll-hide">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.02] font-semibold text-sm ${
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-on-surface-variant hover:bg-slate-100"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.iconName}</span>
              <span className="font-label-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        {/* Local model indicator styled like a card */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-left">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <span className="material-symbols-outlined text-[18px]">dns</span>
            <span>Local Model</span>
          </div>
          <p className="mt-1 text-[11px] text-blue-700 leading-normal font-medium">Ollama powers your PDF tools without API limits.</p>
        </div>

        {/* User Details Button */}
        <button 
          onClick={handleOpenProfileModal}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] font-semibold text-sm w-full text-slate-700 hover:bg-slate-100 cursor-pointer text-left"
        >
          <span className="material-symbols-outlined">account_circle</span>
          <span>User Details</span>
        </button>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all hover:scale-[1.02] font-semibold text-sm w-full text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer text-left"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>

      {/* User Details Claymorphic Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-fade-in">
          <div className="clay-card max-w-md w-full p-6 bg-white border border-white/40 shadow-2xl flex flex-col text-left">
            <header className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-headline-lg text-lg text-on-surface flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-primary text-[24px]">account_circle</span>
                <span>User Profile Details</span>
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>
            
            {modalLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : profileData ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">Full Name</span>
                  <p className="text-base font-bold text-on-surface">{profileData.name}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">Email Address</span>
                  <p className="text-sm font-medium text-on-surface-variant">{profileData.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Scholar Level</span>
                    <p className="text-sm font-bold text-primary mt-0.5">Level {profileData.level || 1}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Total Experience</span>
                    <p className="text-sm font-bold text-on-surface mt-0.5">{profileData.xp || 0} XP</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Daily Streak</span>
                    <p className="text-sm font-bold text-on-surface mt-0.5">{profileData.streak || 0} Days</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-outline uppercase tracking-wider block">Registered On</span>
                    <p className="text-sm font-bold text-on-surface mt-0.5">
                      {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">Unlocked Achievements ({profileData.achievements?.length || 0})</span>
                  {profileData.achievements && profileData.achievements.length > 0 ? (
                    <div className="max-h-28 overflow-y-auto space-y-2 pr-1 scroll-hide">
                      {profileData.achievements.map((ach, idx) => (
                        <div key={idx} className="flex gap-2.5 items-start p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
                          <span className="material-symbols-outlined text-amber-500 text-[18px]">workspace_premium</span>
                          <div className="text-left">
                            <p className="text-xs font-bold text-amber-950">{ach.title}</p>
                            <p className="text-[10px] text-amber-800 leading-tight mt-0.5">{ach.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-outline italic">No achievements unlocked yet. Complete study planners to unlock rewards.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500">Failed to load user details.</p>
            )}
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="clay-button bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl font-semibold text-xs cursor-pointer shadow-md active:scale-95 transition-all border-none"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
