import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import API from "../api/axios";
import toast from "react-hot-toast";

const Notes = () => {
  const { notes, fetchNotes, setNotes, pdfs } = useStudy();
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [linkedPdfId, setLinkedPdfId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date"); // "date" or "name"

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Clean HTML tags from previous react-quill data
  const cleanHtmlContent = (htmlStr) => {
    if (!htmlStr) return "";
    return htmlStr
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .trim();
  };

  const handleCreate = async () => {
    try {
      const { data } = await API.post("/notes", {
        title: "Untitled Note",
        content: ""
      });
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setTitle(data.title);
      setContent(data.content);
      setLinkedPdfId("");
      toast.success("Note created");
    } catch {
      toast.error("Failed to create note");
    }
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    try {
      const { data } = await API.put(`/notes/${selectedNote._id}`, {
        title,
        content,
        pdfId: linkedPdfId || null
      });
      setNotes(notes.map(n => n._id === data._id ? data : n));
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n._id !== id));
      if (selectedNote?._id === id) setSelectedNote(null);
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleTogglePin = async (e, note) => {
    e.stopPropagation();
    try {
      const { data } = await API.put(`/notes/${note._id}`, {
        pinned: !note.pinned
      });
      setNotes(notes.map(n => n._id === data._id ? data : n));
    } catch {
      toast.error("Failed to update note");
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (sortBy === "name") {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="h-full w-full flex bg-[#f5f7fb] text-[#141b2b] overflow-hidden rounded-2xl border border-slate-200/60 min-h-[calc(100vh-48px)]">
      {/* Notes Sidebar */}
      <div className="w-80 border-r border-slate-200/60 flex flex-col bg-white relative">
        <div className="p-5 flex flex-col flex-grow overflow-hidden">
          <header className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_note</span>
              <span>Study Notes</span>
            </h1>
          </header>

          <div className="relative mb-5 group transition-transform duration-200 focus-within:scale-[1.01]">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text"
              placeholder="Search notes..."
              className="clay-input w-full pl-10 pr-4 py-2.5 rounded-xl font-body-md text-on-surface placeholder:text-outline border border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort Tabs / Pills */}
          <div className="flex gap-2 mb-5">
            <button 
              onClick={() => setSortBy("name")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                sortBy === "name" 
                ? "bg-primary border-primary text-white shadow-md shadow-primary/15" 
                : "border-slate-200 bg-slate-50 text-on-surface-variant hover:text-on-surface hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">sort_by_alpha</span>
              <span>Name</span>
            </button>
            <button 
              onClick={() => setSortBy("date")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                sortBy === "date" 
                ? "bg-primary border-primary text-white shadow-md shadow-primary/15" 
                : "border-slate-200 bg-slate-50 text-on-surface-variant hover:text-on-surface hover:bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              <span>Date</span>
            </button>
          </div>

          {/* Notes Card List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-10 scroll-hide">
            {sortedNotes.map((note) => {
              const isSelected = selectedNote?._id === note._id;
              return (
                <div 
                  key={note._id}
                  onClick={() => {
                    setSelectedNote(note);
                    setTitle(note.title);
                    setContent(cleanHtmlContent(note.content));
                    setLinkedPdfId(note.pdfId || "");
                  }}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-300 relative group overflow-hidden text-left ${
                    isSelected 
                      ? 'bg-primary/5 border-primary/30 shadow-inner' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm hover:-translate-y-0.5'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h3 className="font-bold text-sm text-on-surface truncate max-w-[80%]">
                      {note.title || "Untitled Note"}
                    </h3>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => handleTogglePin(e, note)}
                        className={`p-1 hover:bg-slate-100 rounded transition-colors ${note.pinned ? 'text-primary' : 'text-outline hover:text-primary'}`}
                      >
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: note.pinned ? "'FILL' 1" : "'FILL' 0" }}>push_pin</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                    {cleanHtmlContent(note.content) || "No content yet"}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-outline font-semibold">
                      {formatDate(note.updatedAt)}
                    </span>
                    <button 
                      onClick={(e) => handleDelete(e, note._id)}
                      className="p-1 text-outline hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Action Button (FAB) */}
        <button 
          onClick={handleCreate}
          className="absolute bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-container rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer border-none z-20"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-grow flex flex-col bg-white relative">
        {!selectedNote ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-8 opacity-40">
             <span className="material-symbols-outlined text-[64px] mb-4 text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
             <h2 className="text-xl font-bold text-on-surface">Select a note to read</h2>
             <p className="text-sm text-on-surface-variant mt-1">Or click the plus button on the sidebar to write a new one.</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col h-full overflow-hidden">
            {/* Editor Header */}
            <header className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex flex-col gap-2 flex-grow mr-6 text-left">
                <span className="text-[9px] text-outline font-bold uppercase tracking-widest">
                  Last updated {formatDate(selectedNote.updatedAt)}
                </span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl max-w-sm">
                    <span className="material-symbols-outlined text-outline text-[16px]">attachment</span>
                    <select 
                      value={linkedPdfId} 
                      onChange={(e) => setLinkedPdfId(e.target.value)}
                      className="text-xs font-semibold text-on-surface bg-transparent outline-none border-none cursor-pointer truncate w-48"
                    >
                      <option value="" className="bg-white text-on-surface">No related document</option>
                      {pdfs.map(pdf => (
                        <option key={pdf._id} value={pdf._id} className="bg-white text-on-surface">{pdf.title}</option>
                      ))}
                    </select>
                  </div>
                  {linkedPdfId && (
                    <Link 
                      to={`/study/${linkedPdfId}`} 
                      className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>Study Document</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-primary hover:bg-primary-container px-6 py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 border-none cursor-pointer active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Note</span>
                </button>
              </div>
            </header>

            {/* Note Inputs Container */}
            <div className="flex-1 p-8 flex flex-col gap-4 overflow-y-auto bg-white">
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-extrabold bg-transparent border-none outline-none text-on-surface placeholder:text-slate-300 mb-2 focus:ring-0 focus:border-none"
                placeholder="Note title"
              />
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full flex-grow bg-transparent border-none outline-none resize-none text-on-surface-variant leading-relaxed font-sans placeholder:text-slate-300 text-lg focus:ring-0 focus:border-none"
                placeholder="Start typing your study notes here..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
