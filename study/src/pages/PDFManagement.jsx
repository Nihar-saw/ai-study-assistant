import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Search, 
  X,
  UploadCloud,
  FileCheck,
  Sparkles
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import API from "../api/axios";
import toast from "react-hot-toast";
import SummaryViewer from "../components/summary/SummaryViewer";

import { useNavigate } from "react-router-dom";

const PDFManagement = () => {
  const navigate = useNavigate();
  const { pdfs, fetchPDFs, deletePDF } = useStudy();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPDFs();
  }, [fetchPDFs]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const { data } = await API.post("/pdf/upload", formData);
      toast.success("PDF uploaded and analyzed");
      setIsModalOpen(false);
      setFile(null);
      await fetchPDFs();
      navigate(`/study/${data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleViewSummary = async (pdf) => {
    setSelectedPdf(pdf);
    setLoadingSummary(true);
    try {
      const { data } = await API.get(`/summary/${pdf._id}`);
      setSummary(data.summary);
      setIsSummaryOpen(true);
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setLoadingSummary(false);
    }
  };

  const filteredPDFs = pdfs.filter(pdf => 
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Manage and study your PDF materials.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={20} />
          Upload PDF
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Search documents..."
          className="input-field pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredPDFs.map((pdf) => (
            <motion.div 
              key={pdf._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="notion-card p-6 flex flex-col justify-between h-56 cursor-pointer"
              onClick={() => navigate(`/study/${pdf._id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <FileText className="text-indigo-600" size={24} />
                </div>
                <div className="flex items-center gap-1">
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleViewSummary(pdf); }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View Summary"
                  >
                    <Sparkles size={18} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deletePDF(pdf._id); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 truncate mb-1">{pdf.title}</h3>
                {pdf.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{pdf.description}</p>
                )}
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  Uploaded on {new Date(pdf.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4 flex gap-2">
                  {pdf.subject && (
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">
                      {pdf.subject}
                    </span>
                  )}
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleViewSummary(pdf); }}
                    className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                   >
                     AI Summary
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading Overlay for Summary */}
      {loadingSummary && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60 backdrop-blur-sm">
           <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-bold text-gray-600 animate-pulse uppercase tracking-widest">Generating AI Summary...</p>
           </div>
        </div>
      )}

      {/* Summary Viewer Modal */}
      {isSummaryOpen && selectedPdf && (
        <SummaryViewer 
          title={selectedPdf.title}
          summary={summary}
          onClose={() => setIsSummaryOpen(false)}
          onRegenerate={() => handleViewSummary(selectedPdf)}
        />
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Upload Document</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                <div 
                  className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center text-center transition-colors ${file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-400'}`}
                >
                  {file ? (
                    <>
                      <FileCheck className="text-indigo-500 mb-4" size={48} />
                      <p className="text-sm font-medium text-indigo-600 truncate max-w-xs">{file.name}</p>
                      <button 
                        type="button" 
                        onClick={() => setFile(null)}
                        className="text-xs text-gray-500 mt-2 hover:underline"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <UploadCloud className="text-gray-400" size={32} />
                      </div>
                      <p className="text-sm text-gray-500">
                        <label htmlFor="file-upload" className="font-bold text-indigo-600 cursor-pointer hover:underline">Click to upload</label> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF files only (max 10MB)</p>
                      <input 
                        id="file-upload"
                        type="file" 
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                    </>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={!file || uploading}
                  className="btn-primary w-full justify-center py-3 text-lg"
                >
                  {uploading ? "Uploading..." : "Start Learning"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PDFManagement;
