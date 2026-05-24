import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Sparkles, 
  BookOpen, 
  BrainCircuit, 
  MessageSquare, 
  Link as LinkIcon,
  Copy,
  Tags
} from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

import FlashcardList from "../components/study/FlashcardList";
import QuizList from "../components/study/QuizList";
import ChatBox from "../components/study/ChatBox";
import ResourceList from "../components/study/ResourceList";

const StudyView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState(null);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "summary");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const cachedData = useRef({});

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const { data } = await API.get("/pdf");
        const found = data.find(p => p._id === id);
        if (!found) {
          navigate("/pdf");
          return;
        }

        if (!found.description && !found.keyTopics?.length) {
          try {
            const { data: identifiedPdf } = await API.post(`/pdf/${id}/identify`);
            setPdf(identifiedPdf);
          } catch {
            setPdf(found);
          }
          return;
        }

        setPdf(found);
      } catch {
        toast.error("Failed to fetch document");
      }
    };
    fetchPdf();
  }, [id, navigate]);

  useEffect(() => {
    const loadData = async (tab) => {
      if (tab === "chat") return;
      
      if (cachedData.current[tab]) {
        setContent(cachedData.current[tab]);
        return;
      }

      // Prevent sync setState in effect error by deferring
      await Promise.resolve();
      setLoading(true);
      setContent(null);
      try {
        let endpoint = `/summary/${id}`;
        if (tab === "flashcards") endpoint = `/flashcards/${id}`;
        if (tab === "quiz") endpoint = `/quiz/${id}`;
        if (tab === "resources") endpoint = `/resources/${id}`;

        const { data } = await API.get(endpoint);
        setContent(data);
        cachedData.current[tab] = data;
      } catch (error) {
        toast.error(error.response?.data?.message || `Failed to generate ${tab}`);
      } finally {
        setLoading(false);
      }
    };

    if (pdf) loadData(activeTab);
  }, [pdf, activeTab, id]);

  if (!pdf) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  const tabs = [
    { id: "summary", label: "Summary", icon: Sparkles },
    { id: "flashcards", label: "Flashcards", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: BrainCircuit },
    { id: "chat", label: "AI Chat", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: LinkIcon },
  ];

  return (
    <div className="h-full flex flex-col space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/pdf")}
            className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">{pdf.detectedTitle || pdf.title}</h1>
            <p className="text-xs text-gray-400 font-medium">{pdf.subject ? `${pdf.subject} study workspace` : "Study Workspace"}</p>
          </div>
        </div>
        
        <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? "bg-white text-indigo-600 shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-grow notion-card rounded-[2rem] p-8 overflow-hidden flex flex-col">
        {(pdf.description || pdf.keyTopics?.length || pdf.suggestedQuestions?.length) && (
          <div className="mb-6 border-b border-gray-100 pb-5">
            {pdf.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{pdf.description}</p>}
            {!!pdf.keyTopics?.length && (
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-400 uppercase tracking-widest mr-1">
                  <Tags size={14} />
                  Topics
                </span>
                {pdf.keyTopics.map((topic) => (
                  <span key={topic} className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full flex flex-col"
          >
            {activeTab === "chat" ? (
              <ChatBox pdfId={id} suggestedQuestions={pdf.suggestedQuestions || []} />
            ) : loading ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="mt-6 text-indigo-600 font-bold animate-pulse uppercase tracking-widest text-xs">Generating {activeTab}...</p>
              </div>
            ) : content ? (
              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {activeTab === "summary" && (
                  <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => {
                          navigator.clipboard.writeText(content.summary);
                          toast.success("Copied");
                        }}
                        className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"
                       >
                         <Copy size={18} />
                       </button>
                    </div>
                    <div className="prose prose-indigo max-w-none">
                      {content.summary.split('\n').map((para, i) => (
                        <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === "flashcards" && <FlashcardList flashcards={content} />}
                {activeTab === "quiz" && <QuizList quiz={content} />}
                {activeTab === "resources" && <ResourceList resources={content} />}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyView;
