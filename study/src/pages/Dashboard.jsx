import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [plan, setPlan] = useState(null);
  const [weakness, setWeakness] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const profileRes = await API.get("/auth/profile");
      setProfile(profileRes.data);

      const pdfsRes = await API.get("/pdf");
      setPdfs(pdfsRes.data);

      try {
        const planRes = await API.get("/planner");
        setPlan(planRes.data);
      } catch (err) {
        console.log("No plan found");
      }

      try {
        const weaknessRes = await API.get("/weakness");
        setWeakness(weaknessRes.data);
      } catch (err) {
        console.log("No weakness reports found");
      }
    } catch (error) {
      toast.error("Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalXP = profile?.xp || 0;
  const level = profile?.level || 1;
  const nextLevelXP = level * 100;
  const prevLevelXP = (level - 1) * 100;
  const levelProgress = Math.max(0, Math.min(100, ((totalXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

  // Streak details
  const streak = profile?.streak || 0;

  // Filter tasks for Day 1 or today's tasks
  const todayTasks = useMemo(() => {
    if (!plan || !plan.planData?.dailyPlan) return [];
    
    // Find uncompleted tasks from dailyPlan
    return plan.planData.dailyPlan.slice(0, 3).map((item) => {
      const taskKey = `Day ${item.day} - ${item.subject} - ${item.topic}`;
      const completed = plan.completedTasks?.includes(taskKey) || false;
      return { ...item, taskKey, completed };
    });
  }, [plan]);

  const handleToggleTask = async (taskKey) => {
    try {
      const { data } = await API.post("/planner/toggle-task", { taskKey });
      setPlan(data.plan);
      if (data.gamification) {
        toast.success("Task completed! +20 XP");
        // Reload profile stats
        const profileRes = await API.get("/auth/profile");
        setProfile(profileRes.data);
      } else {
        toast.success("Task updated");
      }
    } catch {
      toast.error("Failed to update task");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-gutter text-left">
      {/* Header and Welcome Panel */}
      <header className="flex flex-col gap-4 pb-5 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/50">
        <div>
          <h1 className="font-display-lg text-[28px] font-bold text-on-surface flex items-center gap-2">
            Welcome back, {profile?.name || "Student"}!
          </h1>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Your AI Study Companion workspace is primed for today's learning objectives.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/pdf" className="clay-button bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Study Materials</span>
          </Link>
        </div>
      </header>

      {/* Gamification and Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scholar Level Progress Card */}
        <div className="clay-card p-6 bg-white border border-white/40 flex flex-col justify-between h-48 transition-all hover:-translate-y-1">
          <div className="absolute top-4 right-4 text-primary opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[72px]">workspace_premium</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">Scholar Level</span>
            <h2 className="font-headline-lg text-[22px] text-on-surface mt-1">Level {level} Scholar</h2>
            
            <div className="mt-4 flex items-center justify-between text-[11px] font-semibold text-on-surface-variant">
              <span>{totalXP} XP</span>
              <span>Next level at {nextLevelXP} XP</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <p className="text-[10px] text-outline leading-tight mt-3">Complete study tasks, roadmaps, and quizzes to earn more XP.</p>
        </div>

        {/* Study Streak Card */}
        <div className="clay-card p-6 bg-white border border-white/40 flex flex-col justify-between h-48 transition-all hover:-translate-y-1">
          <div className="absolute top-4 right-4 text-orange-500 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[72px]">bolt</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest block">Daily Streak</span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="font-headline-lg text-[32px] text-on-surface font-extrabold">{streak} Days</h2>
              <span className="material-symbols-outlined text-orange-500 text-[28px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-2 leading-relaxed">
              Maintain your streak by studying or completing interactive reviews daily!
            </p>
          </div>
          <span className="text-[10px] text-teal-600 font-bold tracking-wider uppercase">Streak Active</span>
        </div>

        {/* Workspace Overview Card */}
        <div className="clay-card p-6 bg-gradient-to-br from-primary to-primary-container text-white flex flex-col justify-between h-48 transition-all hover:-translate-y-1 border border-primary/20">
          <div>
            <span className="text-[10px] font-bold text-primary-fixed uppercase tracking-widest block">Workspace Overview</span>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-3xl font-black block">{pdfs.length}</span>
                <p className="text-[9px] text-primary-fixed font-bold uppercase mt-1">Documents</p>
              </div>
              <div>
                <span className="text-3xl font-black block">
                  {weakness?.weakTopics?.length || 0}
                </span>
                <p className="text-[9px] text-primary-fixed font-bold uppercase mt-1">Weak Concepts</p>
              </div>
            </div>
          </div>
          <Link
            to="/analytics"
            className="text-[11px] font-bold text-tertiary-fixed hover:text-white flex items-center gap-1.5 transition-colors group"
          >
            <span>Open Performance Analytics</span>
            <span className="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Today's Tasks & Recent Materials */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Today's study planner schedule */}
        <div className="xl:col-span-2 space-y-6">
          <div className="clay-card p-6 bg-white border border-white/40">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                <span>Today's Study Targets</span>
              </h2>
              <Link to="/planner" className="text-xs font-bold text-primary hover:underline">
                Manage Plan
              </Link>
            </div>

            {todayTasks.length === 0 ? (
              <div className="text-center py-10 text-outline text-sm font-medium">
                No tasks scheduled for today. Set up a study plan in the calendar tab!
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((item) => (
                  <div
                    key={item.taskKey}
                    className="flex items-center justify-between p-3.5 border border-slate-100/70 rounded-xl hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleTask(item.taskKey)}
                        className={`text-lg transition-colors cursor-pointer flex items-center justify-center ${
                          item.completed ? "text-green-500" : "text-slate-300 hover:text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: item.completed ? "'FILL' 1" : "'FILL' 0" }}>
                          {item.completed ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </button>
                      <div>
                        <span className="text-[9px] font-bold bg-blue-50 text-primary px-2 py-0.5 rounded uppercase">
                          {item.subject}
                        </span>
                        <h4 className={`text-sm font-bold text-on-surface mt-1 transition-all ${item.completed ? "line-through text-outline font-normal" : ""}`}>
                          {item.topic}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium truncate max-w-[180px]">
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent study PDF items */}
          <div className="clay-card p-6 bg-white border border-white/40">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">folder</span>
                <span>Recent Workspace Materials</span>
              </h2>
              <Link to="/pdf" className="text-xs font-bold text-primary hover:underline">
                View All
              </Link>
            </div>

            {pdfs.length === 0 ? (
              <div className="text-center py-10 text-outline text-sm font-medium">
                No study documents uploaded yet. Go to Documents to upload your PDFs.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pdfs.slice(0, 4).map((pdf) => (
                  <div
                    key={pdf._id}
                    className="p-4 border border-slate-100 hover:border-slate-200/80 rounded-xl bg-slate-50/30 hover:bg-slate-50/70 transition-colors flex flex-col justify-between h-36"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-on-surface truncate">
                        {pdf.detectedTitle || pdf.title}
                      </h4>
                      <p className="text-xs text-on-surface-variant truncate mt-1">
                        {pdf.description || "General study material"}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-2.5">
                      <span className="text-[9px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded uppercase">
                        {pdf.subject || "General"}
                      </span>
                      <button
                        onClick={() => navigate(`/study/${pdf._id}`)}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer"
                      >
                        Enter Workspace
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations and Achievements sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* AI Advisor insights */}
          <div className="clay-card p-6 bg-white border border-white/40">
            <h3 className="text-sm font-bold text-on-surface border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              <span>AI Advisor Tips</span>
            </h3>

            {weakness?.recommendations && weakness.recommendations.length > 0 ? (
              <div className="space-y-4">
                {weakness.recommendations.slice(0, 2).map((rec, index) => (
                  <div key={index} className="p-3 border border-blue-50 bg-blue-50/20 rounded-xl space-y-1 text-left">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-primary">
                      Revise: {rec.topic}
                    </span>
                    <p className="text-xs text-[#0a2540] leading-relaxed font-semibold">
                      {rec.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant leading-relaxed">
                You are currently performing optimally! Keep completing daily checklist tasks to build your XP.
              </p>
            )}
          </div>

          {/* Badges / Achievements list */}
          <div className="clay-card p-6 bg-white border border-white/40">
            <h3 className="text-sm font-bold text-on-surface border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">workspace_premium</span>
              <span>Recent Achievements</span>
            </h3>

            {profile?.achievements && profile.achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {profile.achievements.slice(0, 4).map((ach) => (
                  <div
                    key={ach.id}
                    className="p-3 border border-slate-100 rounded-xl bg-slate-50/40 text-center flex flex-col justify-center items-center h-24"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200 shadow-sm mb-1.5">
                      <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                    </div>
                    <span className="font-bold text-[10px] text-on-surface block truncate w-full">
                      {ach.title}
                    </span>
                    <span className="text-[8px] text-outline mt-0.5 line-clamp-2 leading-relaxed">
                      {ach.description}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-outline leading-relaxed text-center py-6">
                No badges unlocked yet. Start quiz audits to unlock rewards.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
