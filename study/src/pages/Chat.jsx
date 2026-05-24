import { useState, useRef, useEffect } from "react";
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

const Chat = () => {
  const { pdfs, fetchPDFs, selectedPdfId, setSelectedPdfId } = useStudy();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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
        history
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
      ) : (
        <div className="flex-grow notion-card rounded-3xl flex flex-col overflow-hidden bg-gray-50/30">
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
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
