import { useState } from "react";
import { RotateCcw } from "lucide-react";

function FlashcardList({ flashcards, onRefresh }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) return <div>No flashcards generated.</div>;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-10 h-full w-full">
      <div className="w-full max-w-lg flex justify-between items-center px-4">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Regenerate Flashcards"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      <div 
        className="relative w-full max-w-lg aspect-[4/3] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-xl border border-indigo-50 backface-hidden">
            <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">Question</span>
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              {flashcards[currentIndex].question}
            </h2>
            <p className="mt-8 text-indigo-400 text-sm font-medium animate-pulse">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-xl text-white rotate-y-180 backface-hidden">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-4">Answer</span>
            <p className="text-xl font-medium leading-relaxed">
              {flashcards[currentIndex].answer}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handlePrev}
          className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={handleNext}
          className="p-4 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default FlashcardList;
