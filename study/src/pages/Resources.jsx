import { useEffect } from "react";
import { Link as LinkIcon } from "lucide-react";
import { useStudy } from "../context/StudyContext";
import { useNavigate } from "react-router-dom";

const Resources = () => {
  const { pdfs, fetchPDFs } = useStudy();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">External Resources</h1>
        <p className="text-gray-500 mt-1">Find videos and articles to supplement your learning.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfs.map((pdf) => (
          <div 
            key={pdf._id}
            onClick={() => navigate(`/study/${pdf._id}?tab=resources`)}
            className="notion-card p-6 cursor-pointer flex items-center gap-4 hover:border-indigo-200 group"
          >
            <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <LinkIcon size={24} />
            </div>
            <div className="flex-grow overflow-hidden">
              <h3 className="font-bold text-sm truncate">{pdf.title}</h3>
              <p className="text-xs text-gray-400 mt-1">Find resources</p>
            </div>
          </div>
        ))}
        {pdfs.length === 0 && <p className="text-gray-400 italic">Upload a PDF first to find resources.</p>}
      </div>
    </div>
  );
};

export default Resources;
