import { useEffect, useState, useMemo } from "react";
import { LineChart as ChartIcon, Sparkles, RefreshCw, AlertTriangle, Play, HelpCircle, CheckCircle } from "lucide-react";
import API from "../api/axios";
import toast from "react-hot-toast";

const WeaknessAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [weakness, setWeakness] = useState(null);
  const [loading, setLoading] = useState(false);

  // Custom quiz states
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizTopic, setQuizTopic] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Custom chart state
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxWeeklyVal = useMemo(() => {
    if (!analytics?.weeklyActivity) return 1;
    const vals = analytics.weeklyActivity.map(d => d.value);
    return Math.max(...vals, 1);
  }, [analytics?.weeklyActivity]);

  const svgPoints = useMemo(() => {
    if (!analytics?.quizScores || analytics.quizScores.length === 0) return [];
    const points = [];
    const N = analytics.quizScores.length;
    const paddingLeft = 40;
    const paddingRight = 40;
    const paddingTop = 20;
    const paddingBottom = 30;
    const viewBoxW = 500;
    const viewBoxH = 200;
    const graphWidth = viewBoxW - paddingLeft - paddingRight;
    const graphHeight = viewBoxH - paddingTop - paddingBottom;

    analytics.quizScores.forEach((pt, idx) => {
      const x = N > 1 ? paddingLeft + (idx / (N - 1)) * graphWidth : paddingLeft + graphWidth / 2;
      const scoreVal = pt.score || 0;
      const maxVal = pt.max || 10;
      const scorePercent = Math.min(1, Math.max(0, scoreVal / maxVal));
      const y = paddingTop + (1 - scorePercent) * graphHeight;
      points.push({ x, y, score: scoreVal, max: maxVal, date: pt.date });
    });
    return points;
  }, [analytics?.quizScores]);

  const fetchAnalyticsAndWeakness = async () => {
    setLoading(true);
    try {
      const analyticRes = await API.get("/analytics");
      setAnalytics(analyticRes.data);

      const weaknessRes = await API.get("/weakness");
      setWeakness(weaknessRes.data);
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsAndWeakness();
  }, []);

  const handleStartWeakTopicQuiz = async (topic) => {
    setQuizLoading(true);
    setQuizTopic(topic);
    try {
      const { data } = await API.get(`/weakness/quiz?topic=${encodeURIComponent(topic)}`);
      if (data && data.length > 0) {
        setActiveQuiz(data);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setQuizScore(0);
        setQuizComplete(false);
      } else {
        toast.error("Could not generate questions for this topic");
      }
    } catch {
      toast.error("Failed to generate quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === activeQuiz[currentQuestionIndex].correctAnswer) {
      setQuizScore(quizScore + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    if (currentQuestionIndex < activeQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizComplete(true);
      submitQuizResults();
    }
  };

  const submitQuizResults = async () => {
    try {
      await API.post("/weakness/log", {
        actionType: "quiz_completed",
        score: quizScore,
        maxScore: activeQuiz.length,
        topics: [quizTopic],
      });
      toast.success("Practice quiz results logged! +XP awarded");
      // Reload stats
      fetchAnalyticsAndWeakness();
    } catch {
      console.error("Failed to submit quiz results");
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
    setQuizTopic("");
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 flex items-center gap-2">
            <ChartIcon className="text-indigo-600" size={24} />
            Performance Analytics & Weakness Detection
          </h1>
          <p className="text-sm text-gray-500">AI logs your quiz results and reviews to map conceptual gaps</p>
        </div>

        <button
          onClick={fetchAnalyticsAndWeakness}
          className="toolbar-button border border-gray-200 hover:bg-gray-50 p-2 rounded-lg"
        >
          <RefreshCw size={16} />
          Refresh Stats
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Analytics charts */}
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Study stats summary */}
              <div className="dash-card bg-white border border-gray-200 p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Study Hours Estimate</span>
                <div className="text-3xl font-bold mt-2">{analytics?.studyHours || 0} hrs</div>
                <p className="text-xs text-gray-500 mt-2">Aggregated active reviews and session interactions.</p>
              </div>

              <div className="dash-card bg-white border border-gray-200 p-5 rounded-2xl">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Roadmap Average Progress</span>
                <div className="text-3xl font-bold mt-2">{analytics?.averageCompletion || 0}%</div>
                <p className="text-xs text-gray-500 mt-2">Completion rate across all active syllabi.</p>
              </div>
            </div>

            {/* Weekly Activity chart */}
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-gray-950 mb-4">Study Actions Weekly Volume</h3>
              <div className="h-64 relative flex flex-col justify-between pt-6">
                {analytics?.weeklyActivity && (
                  <>
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-6">
                      <div className="border-t border-dashed border-gray-100 w-full" />
                      <div className="border-t border-dashed border-gray-100 w-full" />
                      <div className="border-t border-dashed border-gray-100 w-full" />
                      <div className="border-b border-gray-200 w-full" />
                    </div>

                    {/* Bars Container */}
                    <div className="relative z-10 flex items-end justify-between gap-3 h-full pb-8">
                      {analytics.weeklyActivity.map((item, idx) => {
                        const heightPercent = (item.value / maxWeeklyVal) * 100;
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-1 bg-gray-900/90 backdrop-blur-sm text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none z-10 whitespace-nowrap font-semibold">
                              {item.value} actions
                            </div>
                            
                            {/* Bar */}
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-500 to-indigo-600 rounded-t-md transition-all duration-300 hover:from-indigo-600 hover:to-indigo-700 cursor-pointer relative shadow-sm"
                              style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            >
                              <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-md" />
                            </div>

                            {/* Label */}
                            <span className="text-[11px] font-medium text-gray-400 mt-2 absolute top-full">{item.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quiz scores line chart */}
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-gray-950 mb-4">Recent Quiz Performance Trends</h3>
              <div className="h-64 relative flex flex-col justify-between">
                {analytics?.quizScores && analytics.quizScores.length > 0 ? (
                  <div className="relative w-full h-full">
                    {/* Tooltip overlay */}
                    {hoveredPoint !== null && svgPoints[hoveredPoint] && (
                      <div 
                        className="absolute bg-gray-900/90 backdrop-blur-sm text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none z-10 font-semibold transition-all duration-150"
                        style={{ 
                          left: `${(svgPoints[hoveredPoint].x / 500) * 100}%`,
                          top: `${(svgPoints[hoveredPoint].y / 200) * 100 - 18}%`,
                          transform: 'translate(-50%, -100%)'
                        }}
                      >
                        <div className="text-[10px] text-gray-400 font-normal">{svgPoints[hoveredPoint].date}</div>
                        <div>Score: {svgPoints[hoveredPoint].score} / {svgPoints[hoveredPoint].max}</div>
                      </div>
                    )}

                    {/* SVG rendering */}
                    <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal grid lines */}
                      <line x1="40" y1="20" x2="460" y2="20" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="40" y1="70" x2="460" y2="70" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="40" y1="120" x2="460" y2="120" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="40" y1="170" x2="460" y2="170" stroke="#e5e7eb" strokeWidth="1" />

                      {/* Y-axis labels */}
                      <text x="30" y="24" fill="#9ca3af" fontSize="10" textAnchor="end">100%</text>
                      <text x="30" y="74" fill="#9ca3af" fontSize="10" textAnchor="end">66%</text>
                      <text x="30" y="124" fill="#9ca3af" fontSize="10" textAnchor="end">33%</text>
                      <text x="30" y="174" fill="#9ca3af" fontSize="10" textAnchor="end">0%</text>

                      {/* Line & Area Path */}
                      {svgPoints.length > 0 && (
                        <>
                          {/* Area Path */}
                          <path
                            d={`${svgPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')} L ${svgPoints[svgPoints.length - 1].x} 170 L ${svgPoints[0].x} 170 Z`}
                            fill="url(#chart-area-grad)"
                          />
                          {/* Stroke Line */}
                          <path
                            d={svgPoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')}
                            fill="none"
                            stroke="#14b8a6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </>
                      )}

                      {/* Points & Interactive Zones */}
                      {svgPoints.map((pt, idx) => (
                        <g key={idx}>
                          {/* Visual Point */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={hoveredPoint === idx ? 5.5 : 4}
                            fill="#fff"
                            stroke="#14b8a6"
                            strokeWidth={hoveredPoint === idx ? 3.5 : 2.5}
                            className="transition-all duration-150"
                          />
                          {/* Date labels below */}
                          <text
                            x={pt.x}
                            y="188"
                            fill="#9ca3af"
                            fontSize="9"
                            textAnchor="middle"
                            fontWeight="500"
                          >
                            {pt.date}
                          </text>
                          {/* Invisible large target for mouse events */}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="15"
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(idx)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      ))}
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Complete practice quizzes to visualize performance trends.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Weakness Insights Column */}
          <div className="xl:col-span-1 space-y-6">
            <div className="dash-card bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-400" />
                Detected Weak Areas
              </h3>

              {weakness?.weakTopics && weakness.weakTopics.length > 0 ? (
                <div className="space-y-4">
                  {weakness.weakTopics.map((t) => (
                    <div key={t.topic} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>{t.topic}</span>
                        <span className="text-indigo-200">{t.score}% strength</span>
                      </div>
                      <div className="w-full bg-indigo-950/60 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-400 to-orange-400 h-2 rounded-full"
                          style={{ width: `${t.score}%` }}
                        />
                      </div>
                      <button
                        onClick={() => handleStartWeakTopicQuiz(t.topic)}
                        disabled={quizLoading}
                        className="text-[10px] font-bold text-teal-400 flex items-center gap-1 hover:underline"
                      >
                        <Play size={10} />
                        Launch Practice Quiz
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-indigo-200 leading-relaxed">
                  No conceptual weak spots registered yet. Keep studying, and the AI examiner will flag points that require review!
                </p>
              )}
            </div>

            {/* AI Revision recommendations */}
            <div className="dash-card bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold text-gray-950 flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-orange-500" />
                Revision Recommendations
              </h3>

              {weakness?.recommendations && weakness.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {weakness.recommendations.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-xs text-gray-600 leading-relaxed border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-gray-950 block">{rec.topic}</span>
                        <span>{rec.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your revision queue is clear! All studies are currently on schedule.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Topic Quiz Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] max-w-xl w-full p-8 shadow-2xl relative flex flex-col max-h-[90vh]">
            <button
              onClick={closeQuiz}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 font-bold"
            >
              Close
            </button>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">
              <Sparkles size={12} />
              Weak Concept Practice: {quizTopic}
            </span>

            {!quizComplete ? (
              <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Question {currentQuestionIndex + 1} of {activeQuiz.length}</span>
                  <span>Score: {quizScore}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  {activeQuiz[currentQuestionIndex].question}
                </h2>

                <div className="space-y-3">
                  {activeQuiz[currentQuestionIndex].options.map((option, idx) => {
                    const isCorrect = option === activeQuiz[currentQuestionIndex].correctAnswer;
                    const isSelected = option === selectedOption;
                    let optionStyle = "border-gray-200 hover:border-indigo-600 bg-white";

                    if (selectedOption) {
                      if (isCorrect) optionStyle = "border-green-500 bg-green-50 text-green-700";
                      else if (isSelected) optionStyle = "border-red-500 bg-red-50 text-red-700";
                      else optionStyle = "border-gray-100 opacity-60";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={!!selectedOption}
                        className={`w-full p-4 rounded-xl border-2 text-left text-sm font-semibold transition-all ${optionStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4 mt-auto">
                  <button
                    onClick={handleNextQuestion}
                    disabled={!selectedOption}
                    className={`px-8 py-3 rounded-xl text-white font-bold text-sm ${
                      !selectedOption ? "bg-gray-200 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {currentQuestionIndex === activeQuiz.length - 1 ? "Finish Audit" : "Next Question"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-6 flex-grow flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 border border-green-200">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Audit Complete!</h2>
                  <p className="text-gray-500 mt-2">
                    You scored <span className="font-bold text-indigo-600">{quizScore} / {activeQuiz.length}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your weakness profile has been successfully updated with this run.
                  </p>
                </div>
                <button
                  onClick={closeQuiz}
                  className="btn-primary px-8 py-3 rounded-xl text-white font-bold text-sm mt-4"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeaknessAnalyticsPage;
