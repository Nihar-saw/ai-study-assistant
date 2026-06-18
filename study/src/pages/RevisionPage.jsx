import { useEffect, useState } from "react";
import { Repeat, Clock, CheckCircle, Plus, Trash2, ShieldAlert, Sparkles } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const RevisionPage = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revisionQueue, setRevisionQueue] = useState([]);
  
  // Add item form state
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const fetchQueueAndPdfs = async () => {
    setLoading(true);
    try {
      const pdfRes = await API.get("/pdf");
      setPdfs(pdfRes.data);

      const revisionRes = await API.get("/revision");
      setRevisionQueue(revisionRes.data);
    } catch (error) {
      toast.error("Failed to load revision queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueAndPdfs();
  }, []);

  const handleAddRevision = async (e) => {
    e.preventDefault();
    if (!selectedPdfId || !customTopic.trim() || !dueTime) {
      toast.error("Please fill in all fields.");
      return;
    }

    setAddingItem(true);
    try {
      await API.post("/revision", {
        pdfId: selectedPdfId,
        topic: customTopic.trim(),
        dueTime: new Date(dueTime).toISOString(),
      });
      toast.success("Revision topic added to queue! +10 XP");
      // Reset form
      setCustomTopic("");
      setDueTime("");
      // Refresh list
      const revisionRes = await API.get("/revision");
      setRevisionQueue(revisionRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add revision item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await API.put(`/revision/${id}/complete`);
      toast.success("Revision completed! +30 XP awarded");
      // Refresh list
      const revisionRes = await API.get("/revision");
      setRevisionQueue(revisionRes.data);
    } catch (error) {
      toast.error("Failed to update revision status");
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/revision/${id}`);
      toast.success("Revision item removed");
      setRevisionQueue(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      toast.error("Failed to delete revision item");
    }
  };

  // Find selected PDF key topics to suggest
  const selectedPdf = pdfs.find(p => p._id === selectedPdfId);
  const suggestedTopics = selectedPdf?.keyTopics || [];

  const pendingItems = revisionQueue.filter(item => !item.completed);
  const completedItems = revisionQueue.filter(item => item.completed);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <Repeat className="text-indigo-600" size={24} />
            Revision Scheduler & Queue
          </h1>
          <p className="text-sm text-gray-500">Configure custom due times to review topics and monitor your queue progression</p>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Create Revision Schedule Form */}
          <div className="xl:col-span-1 space-y-6">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2 mb-4">
                <Plus size={18} className="text-indigo-600" />
                Schedule Custom Revision
              </h3>

              <form onSubmit={handleAddRevision} className="space-y-4">
                {/* PDF selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Select Document</label>
                  <select
                    value={selectedPdfId}
                    onChange={(e) => {
                      setSelectedPdfId(e.target.value);
                      setCustomTopic(""); // reset topic suggestion
                    }}
                    className="w-full text-sm font-semibold rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-indigo-500 text-gray-800"
                    required
                  >
                    <option value="">-- Choose Study Material --</option>
                    {pdfs.map(pdf => (
                      <option key={pdf._id} value={pdf._id}>
                        {pdf.detectedTitle || pdf.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Topic to Review</label>
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g. SQL Normalization, ER Model"
                    className="w-full text-sm font-medium rounded-xl border border-gray-200 p-3 outline-none focus:border-indigo-500 text-gray-800 bg-white placeholder-gray-400"
                    required
                  />
                </div>

                {/* Key topics tags suggestion */}
                {suggestedTopics.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Suggested PDF Topics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedTopics.map(topic => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setCustomTopic(topic)}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-all ${
                            customTopic === topic
                              ? "bg-indigo-55 text-indigo-600 border-indigo-200"
                              : "bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date / Time Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Due Time</label>
                  <input
                    type="datetime-local"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full text-sm font-medium rounded-xl border border-gray-200 p-3 outline-none focus:border-indigo-500 text-gray-800 bg-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingItem}
                  className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl text-sm font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={16} />
                  {addingItem ? "Scheduling..." : "Schedule Revision (+10 XP)"}
                </button>
              </form>
            </div>
          </div>

          {/* Pending / Due Now Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Active Queue */}
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-950 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" />
                Active Revision Queue
                {pendingItems.length > 0 && (
                  <span className="ml-2 text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                    {pendingItems.length} topics pending
                  </span>
                )}
              </h2>

              {pendingItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCircle size={40} className="text-green-500 mb-4" />
                  <h3 className="font-bold text-sm text-gray-900">Your queue is fully cleared!</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    There are no scheduled revisions. Set a due time for a topic to populate your queue.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingItems.map((item) => {
                    const isOverdue = new Date(item.dueTime) <= new Date();
                    return (
                      <div
                        key={item._id}
                        className={`border p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isOverdue 
                            ? "border-red-100 bg-red-50/10 hover:bg-red-50/20" 
                            : "border-gray-100 bg-gray-50/10 hover:bg-gray-50/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {isOverdue ? (
                              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                                <ShieldAlert size={10} className="animate-pulse" />
                                OVERDUE
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                SCHEDULED
                              </span>
                            )}
                            <span className="text-[10px] font-semibold text-gray-400">
                              Due: {new Date(item.dueTime).toLocaleString()}
                            </span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-950 mt-1">{item.topic}</h3>
                          <p className="text-xs text-gray-500 truncate max-w-sm">
                            Document: {item.pdfId?.detectedTitle || item.pdfId?.title || "Syllabus"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMarkCompleted(item._id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle size={12} />
                            Complete (+30 XP)
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 border border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-colors cursor-pointer"
                            title="Remove from queue"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Revision Queue */}
            {completedItems.length > 0 && (
              <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Completed Reviews (Last {completedItems.length} topics)
                </h2>

                <div className="space-y-3 opacity-60">
                  {completedItems.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-50 p-3 rounded-lg flex items-center justify-between gap-4 bg-gray-50/20"
                    >
                      <div>
                        <h4 className="font-semibold text-xs text-gray-900 line-through">{item.topic}</h4>
                        <p className="text-[10px] text-gray-400 truncate max-w-xs">
                          {item.pdfId?.detectedTitle || item.pdfId?.title}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          COMPLETED
                        </span>
                        <p className="text-[9px] text-gray-400 mt-1">
                          Done: {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionPage;
