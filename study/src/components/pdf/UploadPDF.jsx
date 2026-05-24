import { useState, useRef } from "react";
import API from "../../api/axios";

function UploadPDF({ fetchPDFs }) {
  const [pdf, setPdf] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadHandler = async () => {
    if (!pdf) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", pdf);
      const token = localStorage.getItem("token");

      await API.post("/pdf/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPdf(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPDFs();
    } catch (error) {
      console.log(error);
      alert("Failed to upload PDF");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl mb-10 border-dashed border-2 border-indigo-200">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 text-indigo-600">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Upload Study Material</h2>
        <p className="text-gray-500 mb-6 max-w-sm">Select a PDF file to generate AI-powered summaries and study notes instantly.</p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <div className="relative flex-grow w-full">
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={(e) => setPdf(e.target.files[0])}
              className="hidden"
              id="pdf-upload"
            />
            <label 
              htmlFor="pdf-upload"
              className="flex items-center justify-center px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-colors text-sm font-medium text-gray-600 w-full overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {pdf ? pdf.name : "Choose PDF file"}
            </label>
          </div>

          <button
            onClick={uploadHandler}
            disabled={!pdf || uploading}
            className={`btn-primary px-8 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 min-w-[140px] w-full sm:w-auto ${(!pdf || uploading) ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
          >
            {uploading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            ) : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadPDF;