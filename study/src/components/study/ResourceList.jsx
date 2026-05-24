import { motion } from "framer-motion";
import { ExternalLink, SquarePlay, Globe, BookOpen } from "lucide-react";

const ResourceList = ({ resources }) => {
  if (!resources || resources.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
       <BookOpen size={48} className="mb-4" />
       <p className="text-lg font-medium">No external resources found.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in">
      {resources.map((res, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="notion-card p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900">{res.topic}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{res.explanation}</p>
            </div>
            <div className="flex gap-2 ml-4">
               <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res.youtubeQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                title="Search on YouTube"
              >
                <SquarePlay size={20} />
              </a>
              <a 
                href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(res.webQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title="Search on Wikipedia"
              >
                <Globe size={20} />
              </a>
              <a 
                href={`https://scholar.google.com/scholar?q=${encodeURIComponent(res.webQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-800 hover:text-white transition-all shadow-sm"
                title="Search on Google Scholar"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>
        </motion.div>
      ))}
      
      <div className="p-4 bg-indigo-50 rounded-xl text-indigo-700 text-sm flex items-center gap-3">
         <ExternalLink size={18} />
         <p>These resources are generated based on the core topics identified in your document.</p>
      </div>
    </div>
  );
};

export default ResourceList;
