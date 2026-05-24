import { motion } from "framer-motion";
import { Copy, Download, RotateCcw, X } from "lucide-react";
import toast from "react-hot-toast";

const SummaryViewer = ({ title, summary, onClose, onRegenerate }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Copied to clipboard");
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${title}_summary.txt`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <header className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
          <div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">AI Summary</span>
             <h2 className="text-xl font-bold text-gray-900 mt-1 truncate max-w-md">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={copyToClipboard} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Copy">
               <Copy size={20} />
             </button>
             <button onClick={downloadSummary} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Download">
               <Download size={20} />
             </button>
             <button onClick={onRegenerate} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors" title="Regenerate">
               <RotateCcw size={20} />
             </button>
             <div className="w-px h-6 bg-gray-100 mx-2" />
             <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-900 transition-colors">
               <X size={24} />
             </button>
          </div>
        </header>

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <div className="prose prose-indigo max-w-none">
            {summary.split('\n').map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-4">{para}</p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SummaryViewer;
