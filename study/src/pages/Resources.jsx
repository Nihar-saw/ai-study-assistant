import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Resources = () => {
  const { pdfs, fetchPDFs } = useStudy();
  const navigate = useNavigate();
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  // Default select first PDF if none selected
  useEffect(() => {
    if (pdfs && pdfs.length > 0 && !selectedPdf) {
      setSelectedPdf(pdfs[0]);
    }
  }, [pdfs, selectedPdf]);

  // Fetch AI generated external resources when selected PDF changes
  useEffect(() => {
    const fetchResourcesData = async () => {
      if (!selectedPdf) return;
      setLoading(true);
      setResources([]);
      try {
        const { data } = await API.get(`/resources/${selectedPdf._id}`);
        setResources(data);
      } catch (err) {
        console.error("Failed to fetch resources for document", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResourcesData();
  }, [selectedPdf]);

  // Calculate related documents in the workspace
  const relatedPdfs = useMemo(() => {
    if (!selectedPdf || !pdfs) return [];
    return pdfs.filter((p) => {
      // Must be a different PDF
      if (p._id === selectedPdf._id) return false;
      
      // Match by subject
      const subjectMatch = p.subject && selectedPdf.subject && p.subject.toLowerCase() === selectedPdf.subject.toLowerCase();
      
      // Match by overlapping key topics
      const topicMatch = p.keyTopics?.some((topic) => 
        selectedPdf.keyTopics?.some((selectedTopic) => 
          selectedTopic.toLowerCase() === topic.toLowerCase()
        )
      );

      return subjectMatch || topicMatch;
    });
  }, [selectedPdf, pdfs]);

  const filteredPdfs = useMemo(() => {
    if (!pdfs) return [];
    return pdfs.filter((p) => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.subject && p.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [pdfs, searchTerm]);

  return (
    <div className="h-full w-full flex bg-[#f5f7fb] text-[#141b2b] overflow-hidden rounded-2xl border border-slate-200/60 min-h-[calc(100vh-48px)]">
      {/* Left sidebar: PDF Selector */}
      <div className="w-80 border-r border-slate-200/60 flex flex-col bg-white relative">
        <div className="p-5 flex flex-col flex-grow overflow-hidden">
          <header className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
              <span>Resources Library</span>
            </h1>
          </header>

          <div className="relative mb-5 group transition-transform duration-200 focus-within:scale-[1.01]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder="Search library..."
              className="clay-input w-full pl-10 pr-4 py-2.5 rounded-xl font-body-md text-on-surface placeholder:text-outline border border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List of Documents */}
          <div className="flex-grow overflow-y-auto space-y-3 pr-1 pb-10 scroll-hide">
            {filteredPdfs.map((pdf) => {
              const isSelected = selectedPdf?._id === pdf._id;
              return (
                <div 
                  key={pdf._id}
                  onClick={() => setSelectedPdf(pdf)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 relative text-left ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/30 shadow-inner' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  <h4 className="font-bold text-sm text-on-surface truncate">
                    {pdf.detectedTitle || pdf.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[9px] bg-slate-100 text-on-surface-variant font-bold px-2 py-0.5 rounded uppercase">
                      {pdf.subject || "General"}
                    </span>
                    <span className="text-[10px] text-outline">
                      {pdf.keyTopics?.length || 0} topics
                    </span>
                  </div>
                </div>
              );
            })}
            {filteredPdfs.length === 0 && (
              <p className="text-xs text-outline italic text-center py-6">No documents found matching search.</p>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Selected Document Resources & Related Documents */}
      <div className="flex-grow flex flex-col bg-white relative overflow-y-auto p-8">
        {!selectedPdf ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center opacity-40">
            <span className="material-symbols-outlined text-[64px] mb-4 text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
            <h2 className="text-xl font-bold text-on-surface">No documents available</h2>
            <p className="text-sm text-on-surface-variant mt-1">Please upload a study PDF under the Documents tab first.</p>
          </div>
        ) : (
          <div className="space-y-8 text-left">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-5 gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2.5 py-1 rounded">
                  {selectedPdf.subject || "General Study"}
                </span>
                <h2 className="font-headline-lg text-2xl text-on-surface mt-2 font-bold leading-snug">
                  {selectedPdf.detectedTitle || selectedPdf.title}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  {selectedPdf.description || "Explore study connections and curated external resources for this document."}
                </p>
              </div>
              <button 
                onClick={() => navigate(`/study/${selectedPdf._id}`)}
                className="clay-button bg-primary hover:bg-primary-container text-white px-5 py-3 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all self-start md:self-center border-none"
              >
                <span>Enter Workspace</span>
                <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
              </button>
            </div>

            {/* Related Documents Section */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">link</span>
                <span>Related Workspace Documents</span>
              </h3>
              
              {relatedPdfs.length === 0 ? (
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl text-center text-xs text-outline italic">
                  No other documents in the same subject or sharing matching topics were found. Upload related documents to see connections.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedPdfs.map((pdf) => (
                    <div 
                      key={pdf._id}
                      className="p-4 border border-slate-100 rounded-2xl bg-white hover:border-slate-200/80 transition-all flex flex-col justify-between h-32 hover:shadow-sm"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-on-surface truncate">{pdf.detectedTitle || pdf.title}</h4>
                        <p className="text-xs text-on-surface-variant truncate mt-1">{pdf.description || "Related workspace reference document"}</p>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-2.5 mt-2">
                        <span className="text-[9px] bg-slate-50 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                          {pdf.subject || "General"}
                        </span>
                        <button 
                          onClick={() => setSelectedPdf(pdf)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          View Resources
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* External AI Generated Resources Section */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">smart_display</span>
                <span>Curated External Resources</span>
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : resources.length === 0 ? (
                <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl text-center text-xs text-outline italic">
                  No external references generated. Ensure document study data is synced.
                </div>
              ) : (
                <div className="space-y-4">
                  {resources.map((res, i) => (
                    <div 
                      key={i}
                      className="p-5 border border-slate-100 rounded-2xl bg-white hover:shadow-sm transition-all text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-on-surface">{res.topic}</h4>
                          <p className="text-xs text-on-surface-variant leading-relaxed">{res.explanation}</p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a 
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(res.youtubeQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            title="Search YouTube Videos"
                          >
                            <span className="material-symbols-outlined text-[18px]">smart_display</span>
                          </a>
                          <a 
                            href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(res.webQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            title="Search Wikipedia"
                          >
                            <span className="material-symbols-outlined text-[18px]">language</span>
                          </a>
                          <a 
                            href={`https://scholar.google.com/scholar?q=${encodeURIComponent(res.webQuery)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center shadow-sm"
                            title="Search Google Scholar"
                          >
                            <span className="material-symbols-outlined text-[18px]">school</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
