import { useEffect, useState } from "react";
import { Briefcase, Play, MessageSquare, Award, AlertCircle, ChevronRight, User, Sparkles } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const InterviewPrepPage = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [type, setType] = useState("Technical");
  
  // Chat input
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [starting, setStarting] = useState(false);

  const fetchPdfsAndSessions = async () => {
    try {
      const pdfRes = await API.get("/pdf");
      setPdfs(pdfRes.data);
      if (pdfRes.data.length > 0) {
        setSelectedPdfId(pdfRes.data[0]._id);
      }

      const sessRes = await API.get("/interview");
      setSessions(sessRes.data);
    } catch {
      toast.error("Failed to load initial data");
    }
  };

  useEffect(() => {
    fetchPdfsAndSessions();
  }, []);

  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!selectedPdfId) {
      toast.error("Please upload or select a PDF doc");
      return;
    }

    setStarting(true);
    try {
      const { data } = await API.post("/interview/start", {
        pdfId: selectedPdfId,
        type,
      });
      setActiveSession(data);
      toast.success("Interview session initialized!");
    } catch {
      toast.error("Failed to start mock interview");
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = inputMsg.trim();
    if (!messageText || !activeSession) return;

    setInputMsg("");
    setSending(true);

    // Append candidate message locally for immediate UI update
    const updatedMessages = [
      ...activeSession.messages,
      { role: "candidate", content: messageText },
    ];
    setActiveSession({ ...activeSession, messages: updatedMessages });

    try {
      const { data } = await API.post(`/interview/${activeSession._id}/message`, {
        message: messageText,
      });
      setActiveSession(data.session);

      if (data.session.isCompleted) {
        toast.success("Mock Interview Completed! +80 XP awarded");
        // Reload global sessions list
        const sessRes = await API.get("/interview");
        setSessions(sessRes.data);
      }
    } catch {
      toast.error("Interviewer failed to respond");
    } finally {
      setSending(false);
    }
  };

  const currentRound = activeSession?.messages.filter((m) => m.role === "candidate").length || 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <Briefcase className="text-indigo-600" size={24} />
            AI Mock Interview Coach
          </h1>
          <p className="text-sm text-gray-500">Practice behavioral, scenario, and technical placement chats</p>
        </div>
      </header>

      {!activeSession ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Configure new session */}
          <div className="xl:col-span-1">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-950 mb-5 flex items-center gap-2">
                <Play size={18} className="text-indigo-600" />
                New Session
              </h2>

              <form onSubmit={handleStartInterview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Subject Document</label>
                  <select
                    value={selectedPdfId}
                    onChange={(e) => setSelectedPdfId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {pdfs.map((pdf) => (
                      <option key={pdf._id} value={pdf._id}>
                        {pdf.detectedTitle || pdf.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Interview Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-indigo-500"
                  >
                    {["Technical", "HR", "Scenario", "Viva"].map((t) => (
                      <option key={t} value={t}>
                        {t} Interview
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={starting}
                  className="w-full btn-primary h-11 rounded-lg justify-center gap-2 mt-2"
                >
                  <Sparkles size={16} />
                  {starting ? "Starting Session..." : "Start Interview Simulation"}
                </button>
              </form>
            </div>
          </div>

          {/* Past Sessions List */}
          <div className="xl:col-span-2">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-950 mb-5 flex items-center gap-2">
                <Award size={18} className="text-indigo-600" />
                Completed Evaluations
              </h2>

              {sessions.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  You have not completed any mock interview sessions yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((sess) => (
                    <div
                      key={sess._id}
                      className="border border-gray-100 p-4 rounded-xl flex items-center justify-between gap-4 hover:bg-gray-50/35 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded">
                            {sess.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(sess.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-950 mt-2 truncate max-w-xs">
                          {sess.pdfId?.detectedTitle || sess.pdfId?.title || "Study Material"}
                        </h3>
                        {sess.evaluation && (
                          <p className="text-xs text-gray-500 mt-1">{sess.evaluation.feedback}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        {sess.evaluation ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-black text-indigo-600">
                              {sess.evaluation.score}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Score</span>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">
                            Incomplete
                          </span>
                        )}

                        <button
                          onClick={() => setActiveSession(sess)}
                          className="p-2 border border-gray-200 hover:border-indigo-600 rounded-lg text-gray-400 hover:text-indigo-600"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Active mock interview UI */
        <div className="dash-card bg-white border border-gray-200 p-0 rounded-3rem shadow-sm overflow-hidden flex flex-col h-[600px]">
          {/* Header */}
          <div className="bg-indigo-900 text-white p-5 flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded uppercase tracking-wider">
                  {activeSession.type} Mock Interview
                </span>
                {!activeSession.isCompleted && (
                  <span className="text-xs text-indigo-300">
                    Question {currentRound + 1} of 3
                  </span>
                )}
              </div>
              <h2 className="font-bold text-base mt-1">Interviewer Bot</h2>
            </div>

            <button
              onClick={() => setActiveSession(null)}
              className="px-4 py-2 border border-indigo-700 hover:bg-indigo-800 rounded-lg text-xs font-bold transition-all text-white"
            >
              Exit Interview
            </button>
          </div>

          {/* Dialogue area */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50">
            {activeSession.messages.map((msg, index) => {
              const isInterviewer = msg.role === "interviewer";
              return (
                <div key={index} className={`flex gap-3 max-w-[80%] ${isInterviewer ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isInterviewer ? "bg-indigo-600" : "bg-teal-600"}`}>
                    {isInterviewer ? <Sparkles size={16} /> : <User size={16} />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isInterviewer ? "bg-white text-gray-900 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none"}`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {/* If completed, show evaluation report */}
            {activeSession.isCompleted && activeSession.evaluation && (
              <div className="border-t border-gray-200 pt-6 mt-8 space-y-6 animate-in">
                <div className="dash-card bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex flex-col justify-center items-center shrink-0 border-4 border-indigo-200">
                    <span className="text-3xl font-black">{activeSession.evaluation.score}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Score</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-indigo-950">Recruiter Evaluation Report</h3>
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      {activeSession.evaluation.feedback}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-gray-100 bg-white rounded-xl">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-green-600 mb-2">Strengths</h4>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {activeSession.evaluation.detailedEvaluation?.strengths?.map((s) => (
                        <li key={s} className="list-disc list-inside">{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-100 bg-white rounded-xl">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-red-500 mb-2">Weaknesses</h4>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {activeSession.evaluation.detailedEvaluation?.weaknesses?.map((w) => (
                        <li key={w} className="list-disc list-inside">{w}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 border border-gray-100 bg-white rounded-xl">
                    <h4 className="font-bold text-xs uppercase tracking-wide text-indigo-600 mb-2">Improvement Tips</h4>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {activeSession.evaluation.detailedEvaluation?.tips?.map((t) => (
                        <li key={t} className="list-disc list-inside">{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat input box */}
          {!activeSession.isCompleted && (
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white flex gap-3 shrink-0">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                disabled={sending}
                placeholder="Type your response here..."
                className="h-12 flex-grow border border-gray-200 rounded-xl px-4 text-sm outline-none focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={sending || !inputMsg.trim()}
                className="btn-primary px-6 h-12 rounded-xl text-white font-bold whitespace-nowrap gap-1.5 shadow-md shadow-indigo-100"
              >
                <MessageSquare size={16} />
                {sending ? "Sending..." : "Submit Response"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewPrepPage;
