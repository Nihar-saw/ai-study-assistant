import { createContext, useState, useContext, useCallback } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const [pdfs, setPdfs] = useState([]);
  const [notes, setNotes] = useState([]);

  const [selectedPdfId, setSelectedPdfId] = useState(null);

  const fetchPDFs = useCallback(async () => {
    try {
      const { data } = await API.get("/pdf");
      setPdfs(data);
    } catch {
      toast.error("Failed to fetch PDFs");
    }
  }, []);

  const deletePDF = useCallback(async (id) => {
    try {
      await API.delete(`/pdf/${id}`);
      setPdfs((currentPdfs) => currentPdfs.filter(p => p._id !== id));
      setSelectedPdfId((currentId) => currentId === id ? null : currentId);
      toast.success("PDF deleted");
    } catch {
      toast.error("Failed to delete PDF");
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      const { data } = await API.get("/notes");
      setNotes(data);
    } catch {
      toast.error("Failed to fetch notes");
    }
  }, []);

  return (
    <StudyContext.Provider value={{ 
      pdfs, setPdfs, fetchPDFs, deletePDF,
      notes, setNotes, fetchNotes,
      selectedPdfId, setSelectedPdfId 
    }}>
      {children}
    </StudyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStudy = () => useContext(StudyContext);
