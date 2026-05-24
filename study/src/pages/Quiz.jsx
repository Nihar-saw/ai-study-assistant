import { useState, useEffect } from "react";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, 
  ChevronLeft, 
  RotateCcw,
  Trophy,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Quiz = () => {
  const { pdfs, fetchPDFs, selectedPdfId, setSelectedPdfId } = useStudy();
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  const generateQuiz = async (id) => {
    setSelectedPdfId(id);
    setLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    try {
      const { data } = await API.get(`/quiz/${id}`);
      setQuiz(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === quiz[currentIndex].correctAnswer) {
      setScore(score + 1);
      toast.success("Correct!", { icon: '👏' });
    } else {
      toast.error("Oops! Wrong answer", { icon: '❌' });
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Quiz Generator</h1>
        <p className="text-gray-500 mt-1">Test your knowledge with custom MCQs.</p>
      </header>

      {!selectedPdfId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div 
              key={pdf._id}
              onClick={() => generateQuiz(pdf._id)}
              className="notion-card p-6 cursor-pointer flex items-center gap-4 hover:border-indigo-200 group"
            >
              <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <BrainCircuit size={24} />
              </div>
              <div className="flex-grow overflow-hidden">
                <h3 className="font-bold text-sm truncate">{pdf.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Generate quiz</p>
              </div>
            </div>
          ))}
          {pdfs.length === 0 && <p className="text-gray-400 italic">Upload a PDF first to generate quizzes.</p>}
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
            <div className="py-20 flex flex-col items-center text-center">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-500 font-medium animate-pulse">Analyzing text and crafting questions...</p>
            </div>
          ) : showResult ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="notion-card p-12 w-full max-w-xl text-center"
            >
              <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-6">
                <Trophy size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Quiz Results</h2>
              <div className="mt-8 mb-10">
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Final Score</p>
                 <p className="text-6xl font-black text-indigo-600 mt-2">{score}<span className="text-2xl text-gray-300"> / {quiz.length}</span></p>
              </div>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => generateQuiz(selectedPdfId)}
                  className="btn-primary"
                >
                  <RotateCcw size={18} />
                  Retry Quiz
                </button>
                <button 
                  onClick={() => setSelectedPdfId(null)}
                  className="px-6 py-2 bg-gray-50 text-gray-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          ) : quiz.length > 0 ? (
            <div className="w-full max-w-2xl animate-in">
              <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">In Progress</span>
                   <span className="text-2xl font-bold">Question {currentIndex + 1}<span className="text-gray-300 font-medium"> of {quiz.length}</span></span>
                </div>
                <div className="flex gap-1.5">
                   {quiz.map((_, i) => (
                     <div key={i} className={`h-1 w-6 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-indigo-600 w-10' : i < currentIndex ? 'bg-indigo-200' : 'bg-gray-100'}`} />
                   ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-10 leading-tight">
                <Latex>{String(quiz[currentIndex]?.question || "")}</Latex>
              </h2>

              <div className="space-y-4 mb-12">
                {quiz[currentIndex]?.options?.map((option, i) => {
                  const isCorrect = option === quiz[currentIndex]?.correctAnswer;
                  const isSelected = option === selectedOption;
                  
                  let cardStyle = "bg-white border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50";
                  if (selectedOption) {
                    if (isCorrect) cardStyle = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
                    else if (isSelected) cardStyle = "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
                    else cardStyle = "bg-white border-gray-100 opacity-40";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(option)}
                      disabled={!!selectedOption}
                      className={`w-full p-6 rounded-2xl border-2 text-left font-semibold transition-all flex justify-between items-center ${cardStyle}`}
                    >
                      <span className="flex-grow pr-4"><Latex>{String(option || "")}</Latex></span>
                      <AnimatePresence>
                        {selectedOption && isCorrect && (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500">
                             <CheckCircle2 size={24} />
                           </motion.div>
                        )}
                        {selectedOption && isSelected && !isCorrect && (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500">
                             <XCircle size={24} />
                           </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-50">
                <button
                  onClick={handleNext}
                  disabled={!selectedOption}
                  className={`px-10 py-4 rounded-2xl text-white font-bold transition-all ${!selectedOption ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 hover:-translate-y-1'}`}
                >
                  {currentIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Quiz;
