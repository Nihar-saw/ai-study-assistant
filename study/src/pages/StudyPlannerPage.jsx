import { useEffect, useState } from "react";
import { Calendar, Clock, BookOpen, CheckCircle, Circle, Sparkles, Plus, Trash2 } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudyPlannerPage = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form states
  const [examDate, setExamDate] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [dailyHours, setDailyHours] = useState(3);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/planner");
      setPlan(data);
      if (data) {
        setExamDate(data.examDate ? data.examDate.substring(0, 10) : "");
        setSubjects(data.subjects || []);
        setDailyHours(data.dailyStudyHours || 3);
      }
    } catch {
      toast.error("Failed to load study plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleAddSubject = () => {
    const trimmed = newSubject.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      setSubjects([...subjects, trimmed]);
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (sub) => {
    setSubjects(subjects.filter((s) => s !== sub));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!examDate) {
      toast.error("Please select an exam date");
      return;
    }
    if (subjects.length === 0) {
      toast.error("Please add at least one subject");
      return;
    }

    setCreating(true);
    try {
      const { data } = await API.post("/planner/create", {
        examDate,
        subjects,
        dailyStudyHours: Number(dailyHours),
      });
      setPlan(data.plan);
      toast.success("Study plan generated successfully! +50 XP");
    } catch (error) {
      toast.error("Failed to generate plan");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTask = async (taskKey) => {
    try {
      const { data } = await API.post("/planner/toggle-task", { taskKey });
      setPlan(data.plan);
      if (data.gamification) {
        toast.success("Task completed! +20 XP");
      } else {
        toast.success("Task updated");
      }
    } catch {
      toast.error("Failed to toggle task status");
    }
  };

  const isTaskCompleted = (taskKey) => {
    return plan?.completedTasks?.includes(taskKey) || false;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <Calendar className="text-indigo-600" size={24} />
            AI Study Planner & Scheduler
          </h1>
          <p className="text-sm text-gray-500">Design custom revision pathways and daily target calendars</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Setup / Config Form Card */}
          <div className="xl:col-span-1 space-y-6">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-950 mb-5 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                Plan Configuration
              </h2>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Target Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Daily Study Hours</label>
                  <select
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {[2, 3, 4, 5, 6, 8].map((h) => (
                      <option key={h} value={h}>
                        {h} hours per day
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Add Subjects</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DBMS, OS"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="h-10 flex-grow rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* List of current subjects */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {subjects.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        {sub}
                        <button type="button" onClick={() => handleRemoveSubject(sub)} className="hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full btn-primary h-11 rounded-lg justify-center gap-2 mt-2"
                >
                  <Sparkles size={16} />
                  {creating ? "Generating with AI..." : "Generate AI Study Plan"}
                </button>
              </form>
            </div>
          </div>

          {/* Calendar and Task Schedule Display */}
          <div className="xl:col-span-2 space-y-6">
            {plan ? (
              <div className="space-y-6">
                {/* Weekly Goal Alert */}
                <div className="dash-card bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex items-start gap-4">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950">Weekly Milestones</h3>
                    <p className="text-sm text-indigo-700 mt-1 leading-relaxed">
                      {plan.planData?.weeklyPlan?.[0]?.focus || "Stay focused on covering baseline concept details and review quizzes."}
                    </p>
                  </div>
                </div>

                {/* Calendar Grid / Task View */}
                <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl">
                  <h2 className="text-lg font-bold text-gray-950 mb-6">Daily Checklist</h2>

                  <div className="space-y-4">
                    {plan.planData?.dailyPlan?.map((item) => {
                      const taskKey = `Day ${item.day} - ${item.subject} - ${item.topic}`;
                      const completed = isTaskCompleted(taskKey);

                      return (
                        <div
                          key={taskKey}
                          className="flex items-start justify-between gap-4 border border-gray-50 p-4 rounded-xl hover:bg-gray-50/30 transition-colors"
                        >
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleToggleTask(taskKey)}
                              className={`mt-0.5 text-lg flex-shrink-0 transition-colors ${
                                completed ? "text-green-500" : "text-gray-300 hover:text-indigo-600"
                              }`}
                            >
                              {completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </button>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                                  Day {item.day}
                                </span>
                                <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
                                  {item.subject}
                                </span>
                              </div>
                              <h3 className={`font-semibold text-sm mt-2 ${completed ? "text-gray-400 line-through font-normal" : "text-gray-900"}`}>
                                {item.topic}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.task}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="dash-card text-center py-20 border-dashed border-2 border-gray-200 rounded-2xl">
                <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-base font-bold text-gray-900">No active study plan</h3>
                <p className="text-gray-500 mt-1 max-w-sm mx-auto text-sm">
                  Configure your exam target settings on the left sidebar to generate a custom day-by-day learning calendar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlannerPage;
