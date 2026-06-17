import React, { useState, useEffect } from "react";
import { Bot, BookOpen, BarChart2, Award, RotateCcw, HelpCircle, GraduationCap, Lock, Unlock } from "lucide-react";
import RobotChat from "./components/RobotChat";
import ActiveQuiz from "./components/ActiveQuiz";
import QuizHistory from "./components/QuizHistory";
import PerformanceDashboard from "./components/PerformanceDashboard";
import { Quiz, QuizParticipant, QuizResult } from "./types";
import { OFFICIAL_ROSTER } from "./data/roster";
import { DEFAULT_QUIZZES } from "./data/defaultQuizzes";

// PRE-POPULATED INITIAL DATA TO RENDER IMMEDIATELY ON FIRST VISIT
const DEFAULT_PARTICIPANTS: QuizParticipant[] = OFFICIAL_ROSTER;

const DEFAULT_RESULTS: QuizResult[] = [];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("siri");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [participants, setParticipants] = useState<QuizParticipant[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  
  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem("vox_quiz_is_admin") === "true";
  });
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminError, setAdminError] = useState<string>("");
  
  // Quiz running states
  const [activeRunningQuiz, setActiveRunningQuiz] = useState<Quiz | null>(null);
  const [activeParagraph, setActiveParagraph] = useState<string>("");

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername === "IN011673" && adminPassword === "Ashu@0707") {
      setIsAdmin(true);
      localStorage.setItem("vox_quiz_is_admin", "true");
      setShowAdminModal(false);
      setAdminError("");
      setAdminUsername("");
      setAdminPassword("");
      alert("Authenticated successfully as Administrator!");
    } else {
      setAdminError("Invalid Username or Password. Please try again.");
    }
  };

  const handleAdminLogout = () => {
    if (confirm("Are you sure you want to log out of Administrator mode?")) {
      setIsAdmin(false);
      localStorage.setItem("vox_quiz_is_admin", "false");
      alert("Logged out of Administrator mode.");
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const storedQuizzes = localStorage.getItem("voice_quiz_quizzes");
    const storedParticipants = localStorage.getItem("voice_quiz_participants");
    const storedResults = localStorage.getItem("voice_quiz_results");

    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    } else {
      setQuizzes(DEFAULT_QUIZZES);
      localStorage.setItem("voice_quiz_quizzes", JSON.stringify(DEFAULT_QUIZZES));
    }

    if (storedParticipants && JSON.parse(storedParticipants).length > 10) {
      setParticipants(JSON.parse(storedParticipants));
    } else {
      setParticipants(DEFAULT_PARTICIPANTS);
      localStorage.setItem("voice_quiz_participants", JSON.stringify(DEFAULT_PARTICIPANTS));
    }

    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      setResults(DEFAULT_RESULTS);
      localStorage.setItem("voice_quiz_results", JSON.stringify(DEFAULT_RESULTS));
    }

    // Load fallback initial paragraph to quickstart chatbot
    setActiveParagraph(DEFAULT_QUIZZES[0].paragraph);
  }, []);

  // Save updates helper
  const updateQuizzesState = (newQuizzes: Quiz[]) => {
    setQuizzes(newQuizzes);
    localStorage.setItem("voice_quiz_quizzes", JSON.stringify(newQuizzes));
  };

  const updateParticipantsState = (newParticipants: QuizParticipant[]) => {
    setParticipants(newParticipants);
    localStorage.setItem("voice_quiz_participants", JSON.stringify(newParticipants));
  };

  const updateResultsState = (newResults: QuizResult[]) => {
    setResults(newResults);
    localStorage.setItem("voice_quiz_results", JSON.stringify(newResults));
  };

  // Create participant profile
  const handleAddParticipant = (name: string): QuizParticipant => {
    const np: QuizParticipant = {
      id: "p-" + Date.now(),
      name,
      createdAt: new Date().toISOString()
    };
    const updated = [...participants, np];
    updateParticipantsState(updated);
    return np;
  };

  // Log quiz session results
  const handleSaveQuizResult = (result: QuizResult) => {
    const updated = [...results, result];
    updateResultsState(updated);
  };

  // Delete historical quiz
  const handleHandInDelete = (quizId: string) => {
    const updated = quizzes.filter(q => q.id !== quizId);
    updateQuizzesState(updated);
    // Auto clear active loaded if matching
    if (activeRunningQuiz?.id === quizId) {
      setActiveRunningQuiz(null);
    }
  };

  // Clear all test results
  const handleClearTestResults = () => {
    if (confirm("Are you sure you want to completely clear all test results and scores? This action is irreversible and will also make the export reports blank.")) {
      updateResultsState([]);
      alert("All test results have been successfully cleared.");
    }
  };

  // Export full backup of custom quizzes, students, and test reports
  const handleExportBackup = () => {
    const backupData = {
      version: 2,
      quizzes,
      participants,
      results
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `voice_siri_quiz_app_state_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import full backup of custom quizzes, students, and test reports
  const handleImportBackup = (jsonData: any) => {
    try {
      if (!jsonData || typeof jsonData !== "object") {
        throw new Error("Invalid backup format: root element must be a valid JSON object");
      }
      
      const newQuizzes = Array.isArray(jsonData.quizzes) ? jsonData.quizzes : null;
      const newParticipants = Array.isArray(jsonData.participants) ? jsonData.participants : null;
      const newResults = Array.isArray(jsonData.results) ? jsonData.results : null;

      if (!newQuizzes && !newParticipants && !newResults) {
        throw new Error("No compatible quiz data keys (quizzes, participants, results) found inside the backup object.");
      }

      const qLen = newQuizzes?.length || 0;
      const pLen = newParticipants?.length || 0;
      const rLen = newResults?.length || 0;

      if (confirm(`Importing backup detected:\n• ${qLen} Custom Quizzes\n• ${pLen} Students/Participants\n• ${rLen} Test Results\n\nDo you want to apply these to your local session workspace? This will override your current state.`)) {
        if (newQuizzes) updateQuizzesState(newQuizzes);
        if (newParticipants) updateParticipantsState(newParticipants);
        if (newResults) updateResultsState(newResults);
        alert("Session state restored successfully! All charts, tables, and AI histories are now synchronized.");
      }
    } catch (err: any) {
      alert("Import Failure: " + (err.message || "Invalid JSON schema configuration"));
    }
  };

  // Generate quiz endpoint fetcher
  const handleGenerateQuiz = async (paragraph: string, category?: string, questionCount?: number): Promise<void> => {
    let targetUrl = "/api/gemini/quiz";
    const envApiUrl = (import.meta as any).env?.VITE_API_URL;
    if (envApiUrl) {
      targetUrl = `${envApiUrl.replace(/\/$/, "")}/api/gemini/quiz`;
    } else if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      // Fallback to static deployment production api server url configured by user
      targetUrl = "https://ai-voice-command-quiz-robot-1096346854517.asia-southeast1.run.app/api/gemini/quiz";
    }

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paragraph, category, questionCount })
    });

    const data = await response.json();
    if (data.success && data.quiz) {
      const generated: Quiz = data.quiz;
      const updated = [generated, ...quizzes];
      updateQuizzesState(updated);
      setActiveRunningQuiz(generated);
    } else {
      throw new Error(data.error || "Quiz generation failed. Please try again.");
    }
  };

  // Purge/Reset Local database parameters
  const handleResetDatabase = () => {
    if (confirm("Resetting database will clear all your custom logs, participants and results. Do you want to load defaults?")) {
      localStorage.removeItem("voice_quiz_quizzes");
      localStorage.removeItem("voice_quiz_participants");
      localStorage.removeItem("voice_quiz_results");
      setQuizzes(DEFAULT_QUIZZES);
      setParticipants(DEFAULT_PARTICIPANTS);
      setResults(DEFAULT_RESULTS);
      setActiveRunningQuiz(null);
      setActiveParagraph(DEFAULT_QUIZZES[0].paragraph);
      alert("Database reset to templates successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Dynamic Top Header Branding - Clean Minimalism Theme */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              AI-Quiz <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">PRO</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Voice-Enabled Learning System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/70 px-3.5 py-1.5 rounded-full border border-indigo-100">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            <span className="font-semibold uppercase tracking-wider text-[10px]">Active Voice Command System</span>
          </span>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-250 animate-fadeIn font-bold">
                <Unlock size={12} className="text-emerald-600" />
                <span className="font-mono text-[11px]">Admin: IN011673</span>
              </span>
              <button
                id="reset-db-btn"
                onClick={handleResetDatabase}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                title="Reset database to default templates"
              >
                Reset Logs
              </button>
              <button
                id="admin-logout-btn"
                onClick={handleAdminLogout}
                className="text-[11px] text-slate-600 hover:text-slate-800 font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              id="show-admin-login-btn"
              onClick={() => {
                setAdminError("");
                setShowAdminModal(true);
              }}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-indigo-600 font-semibold bg-slate-50 hover:bg-indigo-50 border border-slate-250 hover:border-indigo-200 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
              title="Administrator Login Portal"
            >
              <Lock size={12} />
              <span>Admin Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Body Layout content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between">
        
        {/* Manufacturing Engineering Excellence Centre Banner */}
        <div id="manufacturing-excellence-header-banner" className="w-full mb-6 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between shadow-xs border-l-4 border-l-emerald-600 animate-fadeIn gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 flex-shrink-0 border border-emerald-100">
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-emerald-800 uppercase">
                Manufacturing Engineering Excellance Centre
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Technical Skill Development & Performance Evaluation Suite
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded-lg border border-emerald-100 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
            <span>Offical Hub</span>
          </div>
        </div>

        {/* Check if active gameplay quiz window is loaded */}
        {activeRunningQuiz ? (
          <div className="flex-1">
            <ActiveQuiz
              quiz={activeRunningQuiz}
              participants={participants}
              onAddParticipant={handleAddParticipant}
              onSaveQuizResult={handleSaveQuizResult}
              onCloseQuiz={() => {
                setActiveRunningQuiz(null);
                setActiveTab("analytics"); // Redirect to analytics to view improvement logs!
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col space-y-6 flex-1">
            
            {/* Top Interactive Metric & Info Row - Adds exceptional professionalism & uses blank page space */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 shadow-lg border border-slate-800 animate-fadeIn relative overflow-hidden">
              {/* Subtle design gradient lights */}
              <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              {/* Informative Welcome & Tutorial Hub (7 columns) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 font-mono">
                      Industrial Evaluation Suite
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold font-mono">ACTIVE INTEGRATION</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
                    Interactive Technical Training Hub
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2.5 max-w-xl">
                    Welcome to <strong className="text-indigo-300 font-bold">AI-Quiz</strong>, a modern responsive system that curates high-fidelity multiple choice quizzes using Gemini AI. Load any syllabus manual or test documents about <strong className="text-slate-100 font-medium">PLC Basics, TPM (Total Productive Maintenance), CPUs</strong>, or <strong className="text-slate-100 font-medium">Pneumatic Transmission</strong>. Issue instant audio controls to hear answers spoken, or practice as operators using our high-standards tracking dashboard.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-x-5 gap-y-2 pt-3 text-[11px] text-slate-300 font-mono border-t border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Pass Criteria: <strong className="text-emerald-400 font-bold">80% (8/10 marks)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Point Weight: <strong className="text-indigo-200 font-bold">1 Mark per Q</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Penalty Score: <strong className="text-slate-200 font-semibold">None (0)</strong></span>
                  </div>
                </div>
              </div>

              {/* Metrics Highlights Section (5 columns) */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 self-center">
                {/* Metric 1 */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition duration-200">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono">Available Quizzes</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-white">{quizzes.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Prebuilt & custom topics</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition duration-200">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono">Operators Roster</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-white">{participants.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Registered trainees</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition duration-200">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono">Attempts Logged</p>
                  <p className="text-2xl font-bold font-mono mt-1 text-white">{results.length}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cumulative test-runs</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition duration-200">
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider font-mono">Overall Pass Rate</p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <p className="text-2xl font-bold font-mono text-emerald-400">
                      {results.length > 0 ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0}%
                    </p>
                    <span className="text-[9px] text-emerald-300/80 font-mono font-bold bg-emerald-500/10 px-1 rounded">Target 80%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Passed at 80%+ threshold</p>
                </div>
              </div>
            </div>

            {/* Nav Tab Selectors */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start">
              <button
                id="tab-btn-siri"
                onClick={() => setActiveTab("siri")}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                  activeTab === "siri"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Bot size={14} />
                <span>🗣️ Voice Siri</span>
              </button>

              <button
                id="tab-btn-history"
                onClick={() => setActiveTab("history")}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                  activeTab === "history"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <BookOpen size={14} />
                <span>📝 Search Logs ({quizzes.length})</span>
              </button>

              <button
                id="tab-btn-analytics"
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-xs font-semibold tracking-tight transition-all ${
                  activeTab === "analytics"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <BarChart2 size={14} />
                <span>📊 Performance Dashboard</span>
              </button>
            </div>

            {/* Dynamic Rendering based on Tab State */}
            <div className="flex-1">
              {activeTab === "siri" && (
                <RobotChat
                  onGenerateQuiz={handleGenerateQuiz}
                  onNavigateToQuiz={(quiz) => setActiveRunningQuiz(quiz)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  latestQuiz={quizzes[0] || null}
                  activeParagraph={activeParagraph}
                  setActiveParagraph={setActiveParagraph}
                />
              )}

              {activeTab === "history" && (
                <QuizHistory
                  quizzes={quizzes}
                  onSelectQuiz={(quiz) => setActiveRunningQuiz(quiz)}
                  onDeleteQuiz={handleHandInDelete}
                  isAdmin={isAdmin}
                />
              )}

              {activeTab === "analytics" && (
                <PerformanceDashboard
                  results={results}
                  participants={participants}
                  isAdmin={isAdmin}
                  onClearTestResults={handleClearTestResults}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer credits bar */}
      <footer className="bg-white border-t border-slate-100 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-1.5">
          <span>AI Voice Command Quiz Robot — © 2026 Educational Labs Inc.</span>
          <span>Powered by Gemini & Browser Web Speech API</span>
        </div>
      </footer>

      {/* Search/Authentication Modal Dialog */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-sm w-full overflow-hidden p-6 relative">
            <div className="flex flex-col items-center text-center space-y-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shadow-xs">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Administrator Access</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Please provide administrator credentials to manage log data</p>
              </div>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                  Admin Code ID / Username
                </label>
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. IN011673"
                  className="w-full bg-slate-50 font-mono text-xs border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                  Security Password
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 transition"
                />
              </div>

              {adminError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-[11px] text-rose-600 rounded-xl font-medium animate-shake">
                  ⚠️ {adminError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminUsername("");
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  className="flex-1 text-slate-550 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer text-center text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 text-white bg-indigo-600 hover:bg-indigo-700 font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer text-center shadow-sm"
                >
                  Authenticate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
