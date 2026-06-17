import React, { useState, useRef } from "react";
import { 
  TrendingUp, Award, Clock, Percent, Users, ChevronRight, HelpCircle, GraduationCap, BarChart as BarChartIcon,
  Download, FileSpreadsheet, Trash2, Upload
 } from "lucide-react";
import { QuizResult, QuizParticipant } from "../types";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area 
} from "recharts";

interface PerformanceDashboardProps {
  results: QuizResult[];
  participants: QuizParticipant[];
  isAdmin?: boolean;
  onClearTestResults?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (jsonData: any) => void;
}

export default function PerformanceDashboard({
  results,
  participants,
  isAdmin,
  onClearTestResults,
  onExportBackup,
  onImportBackup
}: PerformanceDashboardProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("All");
  const backupInputRef = useRef<HTMLInputElement>(null);

  const handleBackupUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result;
        if (typeof text !== "string") {
          throw new Error("Could not process uploaded file text structure.");
        }
        const parsed = JSON.parse(text);
        if (onImportBackup) {
          onImportBackup(parsed);
        }
      } catch (err: any) {
        alert("Parsing Error: " + (err.message || "Invalid backup JSON schema"));
      } finally {
        if (backupInputRef.current) {
          backupInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  // 1. Filter results based on the chosen student
  const filteredResults = results.filter(r => 
    selectedStudentId === "All" || r.participantId === selectedStudentId
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 2. Calculations based on filtered results
  const totalAttempts = filteredResults.length;
  const passedQuizzes = filteredResults.filter(r => r.passed).length;
  const passRate = totalAttempts > 0 ? Math.round((passedQuizzes / totalAttempts) * 100) : 0;
  
  const averagePercentage = totalAttempts > 0 
    ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / totalAttempts) 
    : 0;

  const averageTime = totalAttempts > 0 
    ? Math.round(filteredResults.reduce((acc, r) => acc + r.timeTakenSeconds, 0) / totalAttempts) 
    : 0;

  // 3. Prepare data for Recharts: Timeline Progress (Line Chart)
  const timelineData = filteredResults.map((r, index) => ({
    attempt: `Quiz ${index + 1}`,
    score: r.percentage,
    title: r.quizTitle.length > 20 ? r.quizTitle.substring(0, 18) + "..." : r.quizTitle,
    date: new Date(r.date).toLocaleDateString([], { month: "short", day: "numeric" }),
    passed: r.passed ? "Pass" : "Fail"
  }));

  // 4. Prepare data for Recharts: Category Breakdown (Bar Chart)
  const categoryMastery: { [cat: string]: { totalScore: number; count: number } } = {};
  filteredResults.forEach((r) => {
    const cat = r.quizCategory || "General";
    if (!categoryMastery[cat]) {
      categoryMastery[cat] = { totalScore: 0, count: 0 };
    }
    categoryMastery[cat].totalScore += r.percentage;
    categoryMastery[cat].count += 1;
  });

  const categoryData = Object.keys(categoryMastery).map((cat) => ({
    category: cat,
    score: Math.round(categoryMastery[cat].totalScore / categoryMastery[cat].count),
    sessions: categoryMastery[cat].count
  }));

  // 5. Prepare data for Recharts: Pass/Fail Ratios (Pie Chart)
  const pieData = [
    { name: "Passed 👍", value: passedQuizzes, color: "#10b981" },
    { name: "Failed 📚", value: totalAttempts - passedQuizzes, color: "#ef4444" }
  ].filter(item => item.value > 0);

  // CSV EXPORT AGENT FUNCTIONS
  const handleExportCSV = () => {
    const headers = [
      "Participant ID",
      "Participant Name",
      "Quiz ID",
      "Quiz Title",
      "Topic Category",
      "Score Achieved",
      "Total Possible Points",
      "Score Percentage (%)",
      "Pass Status",
      "Time Taken (seconds)",
      "Attempt Date (UTC)"
    ];

    const rows = filteredResults.map(r => [
      r.participantId,
      r.participantName,
      r.quizId,
      r.quizTitle,
      r.quizCategory,
      r.score,
      r.totalPoints,
      r.percentage,
      r.passed ? "Passed" : "Failed",
      r.timeTakenSeconds,
      r.date
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const str = String(val === undefined || val === null ? "" : val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\r\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const profileName = selectedStudentId === "All" ? "All_Participants" : (participants.find(p => p.id === selectedStudentId)?.name || "Participant_Record");
    const sanitizedProfileName = profileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    link.href = url;
    link.setAttribute("download", `quiz_performance_report_${sanitizedProfileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportRosterCSV = () => {
    const headers = [
      "Participant ID",
      "Participant Name",
      "Total Quizzes Attempted",
      "Quizzes Passed",
      "Quizzes Failed",
      "Best Score (%)",
      "Average Score (%)"
    ];

    const rows = participants.map(p => {
      const pResults = results.filter(r => r.participantId === p.id);
      const total = pResults.length;
      const passed = pResults.filter(r => r.passed).length;
      const failed = total - passed;
      const scores = pResults.map(r => r.percentage);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / total) : 0;

      return [
        p.id,
        p.name,
        total,
        passed,
        failed,
        scores.length > 0 ? `${bestScore}%` : "No Attempt",
        scores.length > 0 ? `${avgScore}%` : "No Attempt"
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        const str = String(val === undefined || val === null ? "" : val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\r\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `quiz_participant_roster_summary.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top dashboard navigation metrics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Learning Analytics Dashboard</h2>
            <p className="text-xs text-slate-500">Evaluate pass-fail timelines, response scores, and target curriculum mastery</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* User selector input */}
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5">
              <Users size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Active Profile:</span>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-800 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="All">All Active Users Combined</option>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Export Results to Excel */}
            <button
              id="export-results-btn"
              onClick={handleExportCSV}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs border border-emerald-500"
              title="Download filtering results in Excel format"
            >
              <FileSpreadsheet size={14} />
              <span>Export Scores (Excel)</span>
            </button>

            {/* Export Master Attendance & Rankings */}
            <button
              id="export-roster-btn"
              onClick={handleExportRosterCSV}
              className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 transition cursor-pointer shadow-xs"
              title="Download Master database summary in Excel"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export Roster (Excel)</span>
            </button>

            {/* Complete JSON backup system for live sharing / GitHub Pages migration */}
            {onExportBackup && (
              <button
                id="export-app-state-btn"
                onClick={onExportBackup}
                className="flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-indigo-100 transition cursor-pointer shadow-xs animate-pulse"
                title="Export complete session backup (All Quizzes, Results, Students) to file"
              >
                <Download size={14} className="text-indigo-600" />
                <span>Export Session State (JSON)</span>
              </button>
            )}

            {onImportBackup && (
              <>
                <button
                  id="import-app-state-btn"
                  onClick={() => backupInputRef.current?.click()}
                  className="flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-200 transition cursor-pointer shadow-xs"
                  title="Import complete session backup (All Quizzes, Results, Students) from file"
                >
                  <Upload size={14} className="text-amber-700" />
                  <span>Import Session State (JSON)</span>
                </button>
                <input
                  type="file"
                  ref={backupInputRef}
                  onChange={handleBackupUploadChange}
                  accept=".json"
                  className="hidden"
                />
              </>
            )}

            {/* Clear All Test Results (Admin Only Access) */}
            {isAdmin && onClearTestResults && (
              <button
                id="admin-clear-results-btn"
                onClick={onClearTestResults}
                className="flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
                title="Admin Only: Delete all recorded query session test results"
              >
                <Trash2 size={14} className="text-rose-600" />
                <span>Clear Test Results</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Overview Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Attempts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Attempts</span>
            <h3 className="text-lg font-extrabold text-slate-900">{totalAttempts}</h3>
            <span className="text-[10px] text-slate-400">Completed Sessions</span>
          </div>
        </div>

        {/* KPI: Pass rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className={`p-3 rounded-xl border ${passRate >= 70 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
            <Percent size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Passing Ratio</span>
            <h3 className={`text-lg font-extrabold ${passRate >= 70 ? "text-emerald-600" : "text-rose-600"}`}>{passRate}%</h3>
            <span className="text-[10px] text-slate-400">Passed ({passedQuizzes}) attempts</span>
          </div>
        </div>

        {/* KPI: Avg score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Award size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Average Grade</span>
            <h3 className="text-lg font-extrabold text-slate-900">{averagePercentage}%</h3>
            <span className="text-[10px] text-slate-400">Total metrics average</span>
          </div>
        </div>

        {/* KPI: Avg pace */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Average Speed</span>
            <h3 className="text-lg font-extrabold text-slate-900">{averageTime}s</h3>
            <span className="text-[10px] text-slate-400">Per quiz evaluation</span>
          </div>
        </div>
      </div>

      {totalAttempts === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200">
          <BarChartIcon className="mx-auto text-slate-300 mb-2" size={36} />
          <p className="text-xs font-semibold text-slate-600">No telemetry results logged yet for active participants.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Complete at least one quiz to populate real-time dashboards and timeline charts!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Timeline chart row: spans 8cols on desktop */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                  <TrendingUp size={14} className="text-indigo-600" />
                  <span>Interactive Learning Progress (Gain Timeline)</span>
                </h3>
                <p className="text-[11px] text-slate-450 text-slate-500">Chronological track showing scoring metrics</p>
              </div>
            </div>

            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timelineData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="attempt" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-lg text-xs space-y-1">
                            <p className="font-extrabold text-[10px] text-indigo-400 uppercase tracking-widest">{data.date}</p>
                            <p className="font-bold text-white">{data.title}</p>
                            <p className="text-slate-200 text-[11px]">Score Achieved: <strong className="text-indigo-200 font-bold">{data.score}%</strong></p>
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 mt-1.5 rounded ${
                              data.passed === "Pass" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                            }`}>
                              {data.passed === "Pass" ? "PASSED" : "FAILED"}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" name="Performance Score %" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pass/Fail Ratio state: spans 4cols on desktop */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Performance Pass / Fail Ratio
              </h3>
              <p className="text-[11px] text-slate-500">Distribution ratio targeting the 70% criteria</p>
            </div>

            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center bg-transparent">
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">Pass Rate</span>
                <span className="text-2xl font-black text-slate-900">{passRate}%</span>
              </div>
            </div>

            {/* Micro legend indicators */}
            <div className="space-y-1.5 mt-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-500">{item.value} attempts ({Math.round((item.value / totalAttempts) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Mastery section: full width */}
          <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Educational Category Mastery Breakdown
              </h3>
              <p className="text-[11px] text-slate-500">Average scores achieved per generated paragraph topic</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow text-xs space-y-0.5">
                              <p className="font-bold text-white mb-1">{data.category}</p>
                              <p className="text-indigo-205 text-indigo-300">Avg Score: <strong className="font-bold">{data.score}%</strong></p>
                              <p className="text-slate-300">Total Attempts: <strong className="font-bold">{data.sessions}</strong></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[5, 5, 0, 0]} barSize={40}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.score >= 70 ? "#4f46e5" : "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Focus target recommendations */}
              <div className="md:col-span-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-900">💡 Personalized Cognitive Analytics</h4>
                <p className="text-slate-600 leading-relaxed font-sans font-medium text-[11px]">
                  Siri AI is reviewing your comprehension profiles across all {categoryData.length} study sectors.
                </p>

                <div className="pt-2.5 border-t border-slate-200 space-y-2">
                  <p className="text-slate-500 font-mono text-[10px] uppercase font-bold tracking-wider">Recommendations:</p>
                  {categoryData.length > 0 && (
                    <div className="space-y-1.5">
                      {categoryData.map((d, i) => {
                        const needsFocus = d.score < 70;
                        return (
                          <div key={i} className="flex justify-between items-center text-[11px] font-mono p-1 rounded hover:bg-white transition">
                            <span className="text-slate-700 font-medium">{d.category}:</span>
                            <span className={needsFocus ? "text-rose-600 font-bold" : "bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded"}>
                              {needsFocus ? "⚠️ Focus Required" : "✅ Mastered"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
