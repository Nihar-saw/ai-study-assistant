function SummaryCard({ pdf, isSelected }) {
  const date = new Date(pdf.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className={`glass-card p-5 rounded-3xl transition-all duration-300 border-2 ${isSelected ? 'border-indigo-500 bg-white/90 shadow-xl' : 'border-transparent hover:border-indigo-200'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-red-50 text-red-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className={`font-bold text-sm truncate transition-colors ${isSelected ? 'text-indigo-600' : 'text-gray-900'}`}>
            {pdf.title}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">{date}</p>
        </div>
        {isSelected && (
          <div className="text-indigo-600 animate-in fade-in">
             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
             </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryCard;