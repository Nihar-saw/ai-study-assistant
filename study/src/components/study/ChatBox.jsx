import { useState, useRef, useEffect } from "react";
import API from "../../api/axios";
import { motion } from "framer-motion";
import { Send, User, Bot } from "lucide-react";

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

function ChatBox({ pdfId, suggestedQuestions = [] }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState("Professor");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const { data } = await API.post(`/chat/${pdfId}`, { 
        message: input,
        history,
        tutorMode
      });

      setMessages((prev) => [...prev, { role: "model", text: data.response }]);
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message || "Sorry, I encountered an error. Please try again.";
      setMessages((prev) => [...prev, { role: "model", text: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full grow">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4 shrink-0">
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
        className="flex-grow overflow-y-auto pr-4 mb-6 space-y-6 custom-scrollbar min-h-[400px]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 px-10">
            <Bot size={64} className="mb-4" />
            <p className="text-lg font-medium">Ask me anything about this document!</p>
            <p className="text-sm mt-1">I've analyzed the content and can help you understand complex parts.</p>
            {!!suggestedQuestions.length && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-2xl opacity-100">
                {suggestedQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => setInput(question)}
                    className="text-xs text-gray-700 bg-white border border-gray-200 hover:border-indigo-200 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
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
            <div className={`max-w-[80%] p-4 rounded-2xl ${
              m.role === "user" 
              ? "bg-indigo-600 text-white rounded-tr-none" 
              : "bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm"
            }`}>
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

      <form onSubmit={handleSend} className="relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="input-field pr-16 shadow-inner"
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className={`absolute right-2 top-1.5 p-2.5 rounded-xl transition-all ${
            !input.trim() || loading 
            ? "text-gray-300" 
            : "text-white bg-indigo-600 shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95"
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
