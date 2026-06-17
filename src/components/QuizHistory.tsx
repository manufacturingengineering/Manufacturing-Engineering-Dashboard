import React, { useState } from "react";
import { Search, Calendar, Play, Trash2, Tag, BookOpen, Award } from "lucide-react";
import { Quiz } from "../types";

interface QuizHistoryProps {
  quizzes: Quiz[];
  onSelectQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (quizId: string) => void;
  isAdmin: boolean;
}

export default function QuizHistory({
  quizzes,
  onSelectQuiz,
  onDeleteQuiz,
  isAdmin
}: QuizHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get list of unique categories actually present in historical records
  const uniqueCategories = ["All", ...Array.from(new Set(quizzes.map(q => q.category || "General")))];

  // Apply search/category filters
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.paragraph.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || 
      (quiz.category || "General").toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header filter metrics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Categorized Quiz Logs</h2>
            <p className="text-xs text-slate-500">Review, query, and launch previously generated AI questions</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={14} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, content..."
                className="bg-slate-50 hover:bg-slate-100 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 outline-none border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Category Chips */}
        {uniqueCategories.length > 2 && (
          <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap gap-2">
            <span className="text-xs text-slate-400 self-center font-mono pr-2">Topic Category:</span>
            {uniqueCategories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`cat-chip-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all border cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-sm font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {cat === "All" ? "🌐 All Modules" : cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Quizzes List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg flex items-center space-x-1 border border-indigo-150">
                  <Tag size={10} />
                  <span>{quiz.category || "General"}</span>
                </span>

                <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
                  <Calendar size={11} />
                  <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition truncate-key-name">
                {quiz.title}
              </h3>

              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 line-clamp-3 leading-relaxed">
                "{quiz.paragraph}"
              </div>
            </div>

            {/* Quick Metrics Bar & Controls */}
            <div className="pt-3.5 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center space-x-1">
                  <BookOpen size={11} />
                  <span>{quiz.questions.length} Quest</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-indigo-600 font-semibold">
                  <Award size={11} />
                  <span>{quiz.questions.reduce((acc, q) => acc + q.points, 0)} Pts</span>
                </span>
              </div>

              <div className="flex space-x-2">
                {/* Delete Trigger */}
                {isAdmin && (
                  <button
                    id={`del-quiz-${quiz.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete this generated quiz "${quiz.title}"?`)) {
                        onDeleteQuiz(quiz.id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer border border-transparent hover:border-rose-100"
                    title="Delete quiz logs"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                {/* Take Quiz Trigger */}
                <button
                  id={`play-quiz-${quiz.id}`}
                  onClick={() => onSelectQuiz(quiz)}
                  className="bg-slate-900 hover:bg-indigo-600 text-white hover:text-white border border-slate-800 hover:border-indigo-500 font-bold text-xs py-1.5 px-3 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  title="Perform this quiz"
                >
                  <Play size={10} className="fill-current" />
                  <span>Perform Quiz</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredQuizzes.length === 0 && (
          <div className="col-span-full bg-slate-50/50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
            <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-xs font-semibold text-slate-600">No quizzes matched your filter parameters.</p>
            <p className="text-[11px] text-slate-400 mt-1">Try changing your search parameters, chip flags, or ask Siri to generate a brand new quiz!</p>
          </div>
        )}
      </div>
    </div>
  );
}
