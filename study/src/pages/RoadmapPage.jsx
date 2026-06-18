import { useEffect, useState } from "react";
import { GitFork, BookOpen, CheckCircle, Circle, ArrowRight, Sparkles } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const RoadmapPage = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { data } = await API.get("/pdf");
        setPdfs(data);
        if (data.length > 0) {
          setSelectedPdfId(data[0]._id);
        }
      } catch (error) {
        toast.error("Failed to load documents");
      }
    };
    fetchPdfs();
  }, []);

  useEffect(() => {
    if (!selectedPdfId) return;

    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/roadmap/${selectedPdfId}`);
        // data contains { roadmap, gamification }
        setRoadmap(data.roadmap || data);
      } catch (error) {
        toast.error("Failed to load or generate roadmap");
        setRoadmap(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, [selectedPdfId]);

  const handleToggleComplete = async (topicId) => {
    try {
      const { data } = await API.post(`/roadmap/${selectedPdfId}/toggle/${topicId}`);
      setRoadmap(data.roadmap);
      if (data.gamification) {
        toast.success(`Topic completed! +${data.gamification.newAchievements?.length > 0 ? "Achievement Unlocked!" : "15 XP Awarded"}`);
      } else {
        toast.success("Progress updated!");
      }
    } catch (error) {
      toast.error("Failed to update topic status");
    }
  };

  const getSubtopics = (parentId) => {
    return roadmap?.topics.filter((t) => t.parent === parentId) || [];
  };

  const rootTopics = roadmap?.topics.filter((t) => !t.parent) || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <GitFork className="text-indigo-600" size={24} />
            AI Learning Roadmap
          </h1>
          <p className="text-sm text-gray-500">Track and complete concepts from your uploaded study materials</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Select Study Doc:</label>
          <select
            value={selectedPdfId}
            onChange={(e) => setSelectedPdfId(e.target.value)}
            className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 max-w-xs"
          >
            {pdfs.map((pdf) => (
              <option key={pdf._id} value={pdf._id}>
                {pdf.detectedTitle || pdf.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : roadmap ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Visual Progress Card */}
          <div className="xl:col-span-1 space-y-6">
            <div className="dash-card bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
                <GitFork size={200} />
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
                <Sparkles size={12} />
                AI Generated Roadmap
              </span>

              <h2 className="text-xl font-bold mt-4">Syllabus Completion</h2>
              <div className="mt-8 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tracking-tight">{roadmap.progress}%</span>
                <span className="text-indigo-200 text-sm">completed</span>
              </div>

              {/* Custom progress bar */}
              <div className="mt-6 w-full bg-indigo-800 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-teal-400 to-cyan-300 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.progress}%` }}
                />
              </div>

              <p className="text-xs text-indigo-200 mt-6 leading-relaxed">
                Marking concepts complete updates your global study analytics and awards bonus XP to level up your scholar profile!
              </p>
            </div>

            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl">
              <h3 className="text-base font-bold text-gray-950">Study Suggestions</h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="p-1 rounded bg-teal-50 text-teal-600 mt-0.5">
                    <CheckCircle size={14} />
                  </div>
                  <span>Study topics hierarchically, ensuring baseline prerequisites are marked complete first.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <div className="p-1 rounded bg-indigo-50 text-indigo-600 mt-0.5">
                    <BookOpen size={14} />
                  </div>
                  <span>Generate custom practice quizzes for marked topics to audit your conceptual knowledge.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Hierarchical Roadmap Tree */}
          <div className="xl:col-span-2 space-y-4">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-gray-950 mb-6 flex items-center gap-2">
                Concepts Tree Structure
              </h2>

              {rootTopics.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  No chapters generated yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {rootTopics.map((root, index) => {
                    const subtopics = getSubtopics(root.id);

                    return (
                      <div key={root.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleToggleComplete(root.id)}
                              className={`mt-1 text-lg flex-shrink-0 transition-colors ${
                                root.isCompleted ? "text-green-500" : "text-gray-300 hover:text-indigo-600"
                              }`}
                            >
                              {root.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                            </button>
                            <div>
                              <h3 className={`font-bold text-base ${root.isCompleted ? "text-gray-400 line-through" : "text-gray-900"}`}>
                                Chapter {index + 1}: {root.name}
                              </h3>
                              {root.keyConcepts?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {root.keyConcepts.map((concept) => (
                                    <span key={concept} className="text-xs bg-indigo-50/50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium">
                                      {concept}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Nested Sub-topics */}
                        {subtopics.length > 0 && (
                          <div className="mt-4 ml-8 border-l-2 border-indigo-50 pl-4 space-y-4">
                            {subtopics.map((sub) => (
                              <div key={sub.id} className="flex items-start justify-between gap-4 hover:bg-gray-50/50 p-2 rounded-lg transition-colors">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => handleToggleComplete(sub.id)}
                                    className={`mt-0.5 text-lg flex-shrink-0 transition-colors ${
                                      sub.isCompleted ? "text-green-500" : "text-gray-300 hover:text-indigo-600"
                                    }`}
                                  >
                                    {sub.isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                                  </button>
                                  <div>
                                    <h4 className={`font-semibold text-sm ${sub.isCompleted ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                      {sub.name}
                                    </h4>
                                    {sub.keyConcepts?.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {sub.keyConcepts.map((concept) => (
                                          <span key={concept} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                            {concept}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="dash-card text-center py-20 border-dashed border-2 border-gray-200">
          <p className="text-gray-500">Please upload a document to unlock the AI study workspace and roadmaps!</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapPage;
