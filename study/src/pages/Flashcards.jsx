import { useState, useEffect } from "react";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Flashcards = () => {
  const { pdfs, fetchPDFs, selectedPdfId, setSelectedPdfId } = useStudy();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  const generateFlashcards = async (id) => {
    setSelectedPdfId(id);
    setLoading(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    try {
      const { data } = await API.get(`/flashcards/${id}`);
      setFlashcards(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
        <p className="text-gray-500 mt-1">Practice and memorize with AI-generated cards.</p>
      </header>

      {!selectedPdfId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div 
              key={pdf._id}
              onClick={() => generateFlashcards(pdf._id)}
              className="notion-card p-6 cursor-pointer flex items-center gap-4 hover:border-indigo-200 group"
            >
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BookOpen size={24} />
              </div>
              <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-sm truncate">{pdf.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Generate flashcards</p>
              </div>
            </div>
          ))}
          {pdfs.length === 0 && <p className="text-gray-400 italic">Upload a PDF first to generate flashcards.</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button 
            onClick={() => setSelectedPdfId(null)}
            className="self-start flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ChevronLeft size={18} />
            Back to documents
          </button>

          {loading ? (
            <div className="py-20 flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 font-medium animate-pulse">Generating your flashcards...</p>
            </div>
          ) : flashcards.length > 0 ? (
            <div className="w-full max-w-2xl flex flex-col items-center gap-10">
              <div className="w-full flex justify-between items-center px-4">
                 <span className="text-sm font-bold text-gray-300 tracking-widest uppercase">
                   Card {currentIndex + 1} / {flashcards.length}
                 </span>
                 <button 
                   onClick={() => generateFlashcards(selectedPdfId)}
                   className="text-gray-400 hover:text-indigo-600 transition-colors"
                   title="Regenerate"
                 >
                   <RotateCcw size={18} />
                 </button>
              </div>

              <div 
                className="w-full aspect-[16/10] perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div 
                  className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-white notion-card rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center backface-hidden">
                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.25em] mb-6">Question</span>
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                      <Latex>{String(flashcards[currentIndex]?.question || "")}</Latex>
                    </h2>
                    <div className="absolute bottom-10 flex items-center gap-2 text-gray-300 text-xs font-bold uppercase tracking-widest">
                       <RotateCcw size={12} />
                       Click to flip
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-2xl text-white rotate-y-180 backface-hidden">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.25em] mb-6">Answer</span>
                    <p className="text-xl font-medium leading-relaxed max-h-full overflow-y-auto">
                      <Latex>{String(flashcards[currentIndex]?.answer || "")}</Latex>
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="flex items-center gap-6 mt-4">
                <button 
                  onClick={handlePrev}
                  className="p-5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:shadow-xl"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
               <p className="text-gray-400">Failed to load flashcards. Try again.</p>
               <button onClick={() => generateFlashcards(selectedPdfId)} className="btn-primary mt-4">Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Flashcards;
