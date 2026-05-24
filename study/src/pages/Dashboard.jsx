import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  BookOpen,
  BrainCircuit,
  Check,
  Download,
  FileText,
  Filter,
  MessageSquare,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { useStudy } from "../context/StudyContext";
import toast from "react-hot-toast";

const tabs = ["Productivity", "Documents", "AI Reports", "Study Queue"];

const subjectFallbacks = ["AI", "Math", "Science", "Research", "General"];

const getSubject = (pdf, index) => pdf.subject || subjectFallbacks[index % subjectFallbacks.length];

const formatDate = (value) => {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
};

const MetricCard = ({ label, value, detail, trend, tone = "blue" }) => {
  const tones = {
    blue: "bg-blue-500",
    teal: "bg-teal-500",
    amber: "bg-amber-400",
    rose: "bg-rose-500",
  };

  return (
    <div className="dash-card min-h 132px">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <span className={`h-2 w-2 rounded-full ${tones[tone]}`} />
        {label}
      </div>
      <div className="mt-5 text-3xl font-semibold tracking-tight text-gray-950">{value}</div>
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
        <span className="text-gray-500">{detail}</span>
        <span className={trend.startsWith("+") ? "text-teal-600" : "text-rose-500"}>{trend}</span>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="dash-card flex min-h-220px flex-col items-center justify-center text-center">
    <FileText className="mb-4 text-gray-300" size={42} />
    <h3 className="text-base font-semibold text-gray-900">No study documents yet</h3>
    <p className="mt-1 max-w-sm text-sm text-gray-500">Upload a text-based PDF and the local model will identify it, summarize it, and unlock the study tools.</p>
    <Link to="/pdf" className="btn-primary mt-5">
      <Upload size={16} />
      Upload PDF
    </Link>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { pdfs, notes, fetchPDFs, fetchNotes } = useStudy();
  const [activeTab, setActiveTab] = useState("Productivity");
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [sortKey, setSortKey] = useState("recent");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchPDFs();
    fetchNotes();
  }, [fetchPDFs, fetchNotes]);

  const subjects = useMemo(() => {
    const values = pdfs.map((pdf, index) => getSubject(pdf, index));
    return ["All", ...Array.from(new Set(values))];
  }, [pdfs]);

  const filteredPDFs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = pdfs.filter((pdf, index) => {
      const subject = getSubject(pdf, index);
      const matchesSubject = subjectFilter === "All" || subject === subjectFilter;
      const searchable = [pdf.title, pdf.detectedTitle, pdf.description, subject, ...(pdf.keyTopics || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesSubject && searchable.includes(normalizedQuery);
    });

    return [...rows].sort((a, b) => {
      if (sortKey === "title") return (a.detectedTitle || a.title).localeCompare(b.detectedTitle || b.title);
      if (sortKey === "subject") return (a.subject || "").localeCompare(b.subject || "");
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [pdfs, query, sortKey, subjectFilter]);

  const subjectCounts = useMemo(() => {
    const counts = {};
    pdfs.forEach((pdf, index) => {
      const subject = getSubject(pdf, index);
      counts[subject] = (counts[subject] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [pdfs]);

  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayStr = date.toLocaleDateString("en-US", { weekday: "short" });
      
      let count = 0;
      pdfs.forEach(pdf => {
        if (!pdf.createdAt) return;
        const d = new Date(pdf.createdAt);
        if (d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()) count += 2;
      });
      notes.forEach(note => {
        if (!note.createdAt && !note.updatedAt) return;
        const d = new Date(note.createdAt || note.updatedAt);
        if (d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear()) count += 1;
      });
      
      data.push({ day: dayStr, value: count });
    }
    return data;
  }, [pdfs, notes]);

  const totalTopics = pdfs.reduce((sum, pdf) => sum + (pdf.keyTopics?.length || 0), 0);
  const selectedRows = filteredPDFs.filter((pdf) => selectedIds.includes(pdf._id));
  const maxChart = Math.max(...chartData.map((item) => item.value), 10);

  const toggleSelected = (id) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const exportRows = () => {
    const rows = selectedRows.length ? selectedRows : filteredPDFs;
    if (!rows.length) {
      toast.error("No documents to export");
      return;
    }

    const csv = [
      ["Title", "Subject", "Topics", "Uploaded"],
      ...rows.map((pdf) => [
        pdf.detectedTitle || pdf.title,
        pdf.subject || "General",
        (pdf.keyTopics || []).join("; "),
        formatDate(pdf.createdAt),
      ]),
    ].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "study-documents.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">

      <header className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950">Study Analytics</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="toolbar-button" onClick={() => toast.success("Local model is ready")}>
            <Sparkles size={16} />
            Model Status
          </button>
          <Link to="/pdf" className="btn-primary">
            <Upload size={16} />
            Upload PDF
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "border-gray-900 bg-white text-gray-950 shadow-sm" : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>
        <>
          {(activeTab === "Productivity" || activeTab === "AI Reports") && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Documents Studied" value={pdfs.length} detail="Uploaded PDFs" trend={`+${Math.max(pdfs.length, 1) * 6}%`} tone="blue" />
              <MetricCard label="AI Topics Found" value={totalTopics || "-"} detail="Across documents" trend="+12.4%" tone="teal" />
              <MetricCard label="Notes Created" value={notes.length} detail="Study notes" trend={notes.length ? "+8.3%" : "0%"} tone="amber" />
              <MetricCard label="Review Risk" value={pdfs.length > notes.length ? "Medium" : "Low"} detail="Based on notes coverage" trend={pdfs.length > notes.length ? "-3.2%" : "+4.1%"} tone="rose" />
            </section>
          )}

          {activeTab === "Productivity" && (
            <section className="grid grid-cols-1 gap-4">
              <div className="dash-card">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-950">Weekly Study Productivity</h2>
                    <p className="text-sm text-gray-500">Activity estimate from your uploaded study materials</p>
                  </div>
                  <span className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500">Weekly</span>
                </div>
                {pdfs.length === 0 ? (
                  <div className="flex h-48 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-400 text-sm">
                    No activity data available. Upload a document to start.
                  </div>
                ) : (
                  <>
                    <div className="mb-5 flex items-end gap-3">
                      <span className="text-4xl font-semibold tracking-tight text-gray-950">{chartData.reduce((sum, item) => sum + item.value, 0)}</span>
                      <span className="pb-2 text-sm text-gray-500">study actions</span>
                    </div>
                    <div className="flex h-48 items-end gap-5 rounded-lg border border-gray-100 bg-gradient-to-b from-white to-gray-50 px-8 py-6">
                      {chartData.map((item) => (
                        <button
                          key={item.day}
                          type="button"
                          onClick={() => toast.success(`${item.day}: ${item.value} study actions`)}
                          className="group flex h-full flex-1 flex-col items-center justify-end gap-3"
                        >
                          <span
                            className="w-full max-w-10 rounded-t-lg bg-gradient-to-b from-sky-400 to-blue-600 shadow-sm transition-transform group-hover:scale-x-110"
                            style={{ height: `${(item.value / maxChart) * 100}%` }}
                          />
                          <span className="text-xs font-medium text-gray-500">{item.day}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {activeTab === "AI Reports" && (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <div className="dash-card p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                 <Sparkles size={40} className="text-indigo-400 mb-4" />
                 <h3 className="text-lg font-bold">AI Insights Generation</h3>
                 <p className="text-gray-500 mt-2">Select a document from your library to generate a comprehensive AI report.</p>
                 <button className="btn-primary mt-6" onClick={() => setActiveTab("Documents")}>Browse Documents</button>
              </div>
              <div className="dash-card">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-gray-950">Knowledge Distribution</h2>
                    <p className="text-sm text-gray-500">Subject segmentation across PDFs</p>
                  </div>
                  <span className="text-2xl font-semibold text-gray-950">{pdfs.length}</span>
                </div>
                <div className="space-y-3">
                  {subjectCounts.map(([subject, count], index) => (
                    <button
                      key={subject}
                      onClick={() => setSubjectFilter(subject)}
                      className="flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left text-sm hover:bg-gray-100"
                    >
                      <span className="flex items-center gap-2 text-gray-600">
                        <span className={`h-2 w-2 rounded-full ${index === 0 ? "bg-teal-400" : index === 1 ? "bg-blue-500" : "bg-sky-400"}`} />
                        {subject}
                      </span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === "Study Queue" && (
            <div className="dash-card p-16 flex flex-col items-center justify-center text-center border-dashed">
              <BookOpen size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">Your queue is clear</h3>
              <p className="text-gray-500 mt-2">You have completed all scheduled flashcards and quizzes for today.</p>
              <button className="btn-primary mt-6" onClick={() => setActiveTab("Documents")}>Study Something New</button>
            </div>
          )}

          {activeTab === "Documents" && (
            pdfs.length === 0 ? <EmptyState /> :
            <section className="dash-card overflow-hidden p-0">
              <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-950">Document Performance Overview</h2>
                <p className="text-sm text-gray-500">{filteredPDFs.length} result{filteredPDFs.length === 1 ? "" : "s"} in your current view</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    className="h-10 w-64 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search PDFs, topics..."
                  />
                </div>
                <select className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm" value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)}>
                  {subjects.map((subject) => <option key={subject}>{subject}</option>)}
                </select>
                <button className="toolbar-button" onClick={() => setSortKey(sortKey === "recent" ? "title" : sortKey === "title" ? "subject" : "recent")}>
                  <ArrowUpDown size={16} />
                  Sort
                </button>
                <button className="toolbar-button" onClick={() => setSubjectFilter("All")}>
                  <Filter size={16} />
                  Reset
                </button>
                <button className="btn-primary" onClick={exportRows}>
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-5 py-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-blue-700">
                <Check size={14} />
                {selectedIds.length} selected
              </span>
              <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-600" onClick={() => setSelectedIds([])}>Clear</button>
              <span className="text-blue-600">{filteredPDFs.length} result</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="border-b border-gray-100 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="w-12 px-5 py-3"></th>
                    <th className="px-5 py-3">Document Name</th>
                    <th className="px-5 py-3">Subject</th>
                    <th className="px-5 py-3">Topics</th>
                    <th className="px-5 py-3">AI Tools</th>
                    <th className="px-5 py-3">Uploaded</th>
                    <th className="px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPDFs.map((pdf, index) => (
                    <motion.tr key={pdf._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <input type="checkbox" checked={selectedIds.includes(pdf._id)} onChange={() => toggleSelected(pdf._id)} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{pdf.detectedTitle || pdf.title}</div>
                        <div className="mt-1 max-w-xs truncate text-xs text-gray-500">{pdf.description || pdf.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">{getSubject(pdf, index)}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{pdf.keyTopics?.length || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button className="icon-pill" onClick={() => navigate(`/study/${pdf._id}`)} title="Summary"><Sparkles size={14} /></button>
                          <button className="icon-pill" onClick={() => navigate(`/study/${pdf._id}?tab=chat`)} title="Chat"><MessageSquare size={14} /></button>
                          <button className="icon-pill" onClick={() => navigate(`/study/${pdf._id}?tab=flashcards`)} title="Flashcards"><BookOpen size={14} /></button>
                          <button className="icon-pill" onClick={() => navigate(`/study/${pdf._id}?tab=quiz`)} title="Quiz"><BrainCircuit size={14} /></button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(pdf.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700" onClick={() => navigate(`/study/${pdf._id}`)}>
                          Study
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            </section>
          )}
        </>
      </div>
    </div>
  );
};

export default Dashboard;
