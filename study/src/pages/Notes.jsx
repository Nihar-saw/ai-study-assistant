import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// removed framer-motion
import { 
  Plus, 
  Search, 
  Trash2, 
  Pin, 
  Save, 
  StickyNote,
  FileText
} from "lucide-react";
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


  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

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

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-10">
      {/* Notes Sidebar */}
      <div className="w-80 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notes</h1>
          <button 
            onClick={handleCreate}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search notes..."
            className="input-field pl-9 text-sm py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flexgrow:1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {filteredNotes.map((note) => (
            <div 
              key={note._id}
              onClick={() => {
                setSelectedNote(note);
                setTitle(note.title);
                setContent(note.content);
                setLinkedPdfId(note.pdfId || "");
              }}
              className={`notion-card p-4 cursor-pointer transition-all ${selectedNote?._id === note._id ? 'border-indigo-200 bg-indigo-50/30 ring-1 ring-indigo-200' : ''}`}
            >
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm truncate pr-4">{note.title || "Untitled"}</h3>
                <button 
                  onClick={(e) => handleTogglePin(e, note)}
                  className={`transition-colors ${note.pinned ? 'text-orange-500' : 'text-gray-300 hover:text-orange-400'}`}
                >
                  <Pin size={14} fill={note.pinned ? "currentColor" : "none"} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                {note.content.replace(/<[^>]*>/g, '') || "No content"}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] text-gray-300 font-medium">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={(e) => handleDelete(e, note._id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flexgrow notion-card rounded-3xl overflow-hidden flex flex-col">
        {!selectedNote ? (
          <div className="flexgrow flex flex-col items-center justify-center text-center opacity-30">
             <StickyNote size={64} className="mb-4" />
             <h2 className="text-xl font-bold">Select a note to read</h2>
             <p className="text-sm">Or create a new one to start writing.</p>
          </div>
        ) : (
          <div className="flexgrow flex flex-col h-full animate-in">
            <header className="px-8 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flexgrow">
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xl font-bold bg-transparent outline-none w-full mb-2"
                  placeholder="Note title"
                />
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg max-w-sm">
                    <FileText size={14} className="text-gray-400" />
                    <select 
                      value={linkedPdfId} 
                      onChange={(e) => setLinkedPdfId(e.target.value)}
                      className="text-xs font-medium text-gray-600 bg-transparent outline-none flexgrow w-full cursor-pointer truncate"
                    >
                      <option value="">No related document</option>
                      {pdfs.map(pdf => (
                        <option key={pdf._id} value={pdf._id}>{pdf.title}</option>
                      ))}
                    </select>
                  </div>
                  {linkedPdfId && (
                    <Link 
                      to={`/study/${linkedPdfId}`} 
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                    >
                      Study Document →
                    </Link>
                  )}
                </div>
              </div>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Save size={18} />
                Save Note
              </button>
            </header>
            <div className="flexgrow overflow-hidden relative">
              <ReactQuill 
                theme="snow" 
                value={content || ""} 
                onChange={setContent} 
                className="h-full border-none flex flex-col"
              />
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .quill { display: flex; flex-direction: column; height: 100%; }
        .ql-container.ql-snow { border: none !important; flex-grow: 1; display: flex; flex-direction: column; }
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #f9fafb !important; padding: 12px 32px !important; }
        .ql-editor { padding: 32px !important; font-size: 16px !important; line-height: 1.6 !important; flex-grow: 1; overflow-y: auto; }
      `}} />
    </div>
  );
};

export default Notes;
