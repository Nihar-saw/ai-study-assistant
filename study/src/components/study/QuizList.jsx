import { useState } from "react";

function QuizList({ quiz, onRefresh }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  if (!quiz || quiz.length === 0) return <div>No quiz generated.</div>;

  const handleOptionSelect = (option) => {
    if (selectedOption) return; // Prevent changing after selection
    setSelectedOption(option);
    if (option === quiz[currentIndex].correctAnswer) {
      setScore(score + 1);
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

  if (showResult) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Quiz Completed!</h2>
        <p className="text-gray-500 mt-2 text-xl">Your score: <span className="font-bold text-indigo-600">{score} / {quiz.length}</span></p>
        <div className="flex justify-center mt-10">
          <button 
            onClick={onRefresh || (() => {
              setCurrentIndex(0);
              setScore(0);
              setSelectedOption(null);
              setShowResult(false);
            })}
            className="btn-primary px-8 py-3 rounded-2xl text-white font-bold"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-10">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Question {currentIndex + 1} of {quiz.length}</span>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-semibold text-left mt-1"
            >
              Generate New Quiz
            </button>
          )}
        </div>
        <div className="flex gap-1">
           {quiz.map((_, i) => (
             <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-indigo-600' : i < currentIndex ? 'bg-indigo-200' : 'bg-gray-100'}`}></div>
           ))}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
        {currentQuestion.question}
      </h2>

      <div className="space-y-4 mb-12">
        {currentQuestion.options.map((option, i) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          const isSelected = option === selectedOption;
          
          let cardStyle = "bg-white border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/30";
          if (selectedOption) {
            if (isCorrect) cardStyle = "bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500";
            else if (isSelected) cardStyle = "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500";
            else cardStyle = "bg-white border-gray-100 opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleOptionSelect(option)}
              disabled={!!selectedOption}
              className={`w-full p-5 rounded-2xl border-2 text-left font-semibold transition-all flex justify-between items-center ${cardStyle}`}
            >
              <span>{option}</span>
              {selectedOption && isCorrect && (
                 <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 flex justify-end">
        <button
          onClick={handleNext}
          disabled={!selectedOption}
          className={`px-10 py-4 rounded-2xl text-white font-bold transition-all ${!selectedOption ? 'bg-gray-200 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100'}`}
        >
          {currentIndex === quiz.length - 1 ? "Finish Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}

export default QuizList;
