import { useEffect, useState } from "react";
import { GraduationCap, Award, Brain, CheckCircle, Sparkles, HelpCircle } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const ExamPrepPage = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState("");
  const [mode, setMode] = useState("University");
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const { data } = await API.get("/pdf");
        setPdfs(data);
        if (data.length > 0) {
          setSelectedPdfId(data[0]._id);
        }
      } catch {
        toast.error("Failed to load documents");
      }
    };
    fetchPdfs();
  }, []);

  const fetchExamPrep = async () => {
    if (!selectedPdfId) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/exam/${selectedPdfId}?mode=${mode}`);
      // data contains { prep, gamification }
      setPrep(data.prep?.data || data.data || data.prep || data);
      if (data.gamification) {
        toast.success("Exam prep material generated! +30 XP");
      }
    } catch {
      toast.error("Failed to fetch exam prep material");
      setPrep(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamPrep();
  }, [selectedPdfId, mode]);

  const modes = [
    { id: "University", label: "University Exam Mode", desc: "Written descriptive questions & marks weighting" },
    { id: "Competitive", label: "Competitive Exam Mode", desc: "Highly logical & analytical edge-cases" },
    { id: "Viva", label: "Viva Mode", desc: "Oral examination and quick-fire questions" }
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <GraduationCap className="text-indigo-600" size={24} />
            Exam Preparation Hub
          </h1>
          <p className="text-sm text-gray-500">Generate targeted quiz, essay, and oral viva questions</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">Study Doc:</label>
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

      {/* Mode selection cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`p-4 text-left border rounded-xl transition-all flex flex-col justify-between ${
              mode === m.id
                ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className={`font-bold text-sm ${mode === m.id ? "text-indigo-950" : "text-gray-800"}`}>
                {m.label}
              </span>
              {mode === m.id && <Award size={16} className="text-indigo-600" />}
            </div>
            <span className="text-xs text-gray-500 mt-2">{m.desc}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : prep ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Key Topics & Concepts Side Column */}
          <div className="xl:col-span-1 space-y-6">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-500" />
                Most Important Topics
              </h3>
              <ul className="space-y-3">
                {prep.importantTopics?.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2 mb-4">
                <Brain size={18} className="text-teal-500" />
                Frequently Tested Concepts
              </h3>
              <ul className="space-y-3">
                {prep.frequentConcepts?.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Question Lists */}
          <div className="xl:col-span-2 space-y-6">
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-8">
              {/* Conditional rendering depending on mode */}
              {mode === "University" && (
                <>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded font-semibold">2 Marks</span>
                      Short Answer / Definition Questions
                    </h2>
                    <ul className="mt-4 space-y-4">
                      {prep.twoMarkQuestions?.map((q, i) => (
                        <li key={i} className="text-sm text-gray-700 leading-relaxed font-semibold">
                          Q{i+1}: {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded font-semibold">5 Marks</span>
                      Medium Explanatory Questions
                    </h2>
                    <ul className="mt-4 space-y-4">
                      {prep.fiveMarkQuestions?.map((q, i) => (
                        <li key={i} className="text-sm text-gray-700 leading-relaxed font-semibold">
                          Q{i+1}: {q}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded font-semibold">10 Marks</span>
                      Long Essay / Analytical Questions
                    </h2>
                    <ul className="mt-4 space-y-4">
                      {prep.tenMarkQuestions?.map((q, i) => (
                        <li key={i} className="text-sm text-gray-700 leading-relaxed font-semibold">
                          Q{i+1}: {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {mode === "Competitive" && (
                <div>
                  <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-600" />
                    Conceptual / Tricky Test Inquiries
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Focus on logical derivations, edge scenarios, and parameters.</p>
                  <ul className="mt-6 space-y-5">
                    {/* Combine two and five mark for analytical focus */}
                    {prep.twoMarkQuestions?.concat(prep.fiveMarkQuestions || []).slice(0, 6).map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 leading-relaxed border border-gray-50 p-3.5 rounded-lg bg-gray-50/20 font-semibold">
                        Scenario {i+1}: {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mode === "Viva" && (
                <div>
                  <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <Brain size={16} className="text-indigo-600" />
                    Viva-Voce / Oral Examination Questions
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">Focus on rapid definitions, reasoning, and quick conceptual checks.</p>
                  <ul className="mt-6 space-y-4">
                    {prep.vivaQuestions?.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 leading-relaxed font-semibold flex gap-2">
                        <span className="text-indigo-500">Q{i+1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="dash-card text-center py-20 border-dashed border-2 border-gray-200 rounded-2xl">
          <p className="text-gray-500">Please select or upload a document to generate custom exam study questions.</p>
        </div>
      )}
    </div>
  );
};

export default ExamPrepPage;
