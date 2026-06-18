import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  ChevronLeft,
  FileText,
  User,
  Bot
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const formatBold = (text) => {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((bPart, bIdx) => {
    if (bPart.startsWith("**") && bPart.endsWith("**")) {
      return <strong key={bIdx} className="font-bold text-gray-900">{bPart.substring(2, bPart.length - 2)}</strong>;
    }
    return bPart;
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("```") && part.endsWith("```")) {
      const content = part.substring(3, part.length - 3).trim();
      const firstLineBreak = content.indexOf("\n");
      const code = firstLineBreak !== -1 ? content.substring(firstLineBreak + 1) : content;
      return (
        <pre key={idx} className="bg-gray-800 text-gray-100 p-4 rounded-xl my-3 font-mono text-xs overflow-x-auto whitespace-pre">
          <code>{code}</code>
        </pre>
      );
    }
    
    const lines = part.split("\n");
    return lines.map((line, lIdx) => {
      if (line.startsWith("### ")) {
        return <h4 key={`${idx}-${lIdx}`} className="text-base font-bold text-gray-950 mt-4 mb-2">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={`${idx}-${lIdx}`} className="text-lg font-bold text-gray-950 mt-5 mb-2">{line.replace("## ", "")}</h3>;
      }
      if (line.startsWith("# ")) {
        return <h2 key={`${idx}-${lIdx}`} className="text-xl font-bold text-gray-950 mt-6 mb-3">{line.replace("# ", "")}</h2>;
      }
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const cleanLine = line.trim().substring(2);
        return (
          <li key={`${idx}-${lIdx}`} className="ml-4 list-disc text-sm text-gray-600 leading-relaxed mb-1">
            {formatBold(cleanLine)}
          </li>
        );
      }
      if (line.trim() === "") return <div key={`${idx}-${lIdx}`} className="h-2" />;
      return <p key={`${idx}-${lIdx}`} className="text-sm text-gray-600 leading-relaxed mb-2">{formatBold(line)}</p>;
    });
  });
};

const Chat = () => {
  const navigate = useNavigate();
  const { pdfs, fetchPDFs, selectedPdfId, setSelectedPdfId } = useStudy();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState("Professor");
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const { data } = await API.post(`/chat/${selectedPdfId}`, { 
        message: input,
        history,
        tutorMode
      });

      setMessages((prev) => [...prev, { role: "model", text: data.response }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Chat</h1>
          <p className="text-gray-500 mt-1">Chat with your documents in real-time.</p>
        </div>
        {selectedPdfId && (
          <button 
            onClick={() => setSelectedPdfId(null)}
            className="flex items-center gap-2 text-sm font-medium text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl"
          >
            <ChevronLeft size={18} />
            Switch Document
          </button>
        )}
      </header>

      {!selectedPdfId ? (
        pdfs.length === 0 ? (
          <div className="dash-card text-center py-20 border-dashed border-2 border-gray-200 rounded-2xl bg-white flex flex-col items-center justify-center">
            <MessageSquare className="mx-auto text-gray-300 mb-4 animate-bounce" size={48} />
            <h3 className="text-base font-bold text-gray-900">No documents found</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto text-sm">
              Upload study documents first to start chatting with them in real-time.
            </p>
            <button 
              onClick={() => navigate("/pdf")}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md inline-flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              Upload PDF
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map((pdf) => (
              <div 
                key={pdf._id}
                onClick={() => setSelectedPdfId(pdf._id)}
                className="notion-card p-6 cursor-pointer flex items-center gap-4 hover:border-indigo-200 group"
              >
                <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <div className="flex-grow overflow-hidden">
                  <h3 className="font-bold text-sm truncate">{pdf.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">Start chat</p>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex-grow notion-card rounded-3xl flex flex-col overflow-hidden bg-gray-50/30">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Bot size={14} className="text-indigo-600 animate-pulse" />
              AI Tutor Persona
            </span>
            <select
              value={tutorMode}
              onChange={(e) => setTutorMode(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 outline-none focus:border-indigo-500 text-gray-800"
            >
              {["Professor", "Friend", "Examiner", "Interviewer"].map((mode) => (
                <option key={mode} value={mode}>
                  {mode} Mode
                </option>
              ))}
            </select>
          </div>
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                 <MessageSquare size={64} className="mb-4" />
                 <h2 className="text-xl font-bold">Document Chat Active</h2>
                 <p className="text-sm max-w-xs">I've read "{pdfs.find(p => p._id === selectedPdfId)?.title}". Ask me anything!</p>
              </div>
            )}
            
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`p-2 rounded-xl h-fit ${m.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-gray-100 shadow-sm"}`}>
                  {m.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-[70%] p-4 rounded-2xl ${m.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"}`}>
                  {m.role === "user" ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  ) : (
                    <div className="text-sm leading-relaxed space-y-2">
                      {renderMarkdown(m.text)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex gap-4">
                <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-400">
                  <Bot size={18} />
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-50">
            <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message your document..."
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all pr-16 shadow-inner"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={!input.trim() || loading}
                className={`absolute right-2 top-2 p-3 rounded-xl transition-all ${
                  !input.trim() || loading 
                  ? "text-gray-300" 
                  : "text-white bg-indigo-600 shadow-lg shadow-indigo-100 hover:scale-105"
                }`}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
