import { Link } from "react-router-dom";
import ScrollExpandMedia from "../components/common/ScrollExpandMedia";
import { BrainCircuit } from "lucide-react";

const Landing = () => {
  return (
    <div className="bg-[#0a0a0b] min-h-[100dvh] text-white">
      {/* Simple Nav */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex justify-between items-center bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-2 text-indigo-400">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">StudyAI</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">Log in</Link>
          <Link to="/register" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">Sign up</Link>
        </div>
      </nav>

      {/* Hero with ScrollExpandMedia */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
        bgImageSrc="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
        title="Accelerate Learning"
        scrollToExpand="Scroll to explore"
        textBlend={false}
      >
        <div className="max-w-4xl mx-auto text-center space-y-8 py-20 text-white">
          <h2 className="text-4xl md:text-5xl font-bold">The Future of Study is Here</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            StudyAI leverages advanced artificial intelligence to transform your notes, documents, and slides into interactive flashcards, personalized quizzes, and intelligent summaries.
          </p>
          <div className="pt-8">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-transform hover:scale-105 shadow-lg shadow-indigo-500/25">
              Start for free
            </Link>
          </div>
        </div>
      </ScrollExpandMedia>
    </div>
  );
};

export default Landing;
