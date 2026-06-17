import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowLeft, Volume2, Users, Plus, Award } from "lucide-react";
import { Quiz, QuizParticipant, QuizResult, QuizQuestion } from "../types";

interface ActiveQuizProps {
  quiz: Quiz;
  participants: QuizParticipant[];
  onAddParticipant: (name: string) => QuizParticipant;
  onSaveQuizResult: (result: QuizResult) => void;
  onCloseQuiz: () => void;
}

export default function ActiveQuiz({
  quiz,
  participants,
  onAddParticipant,
  onSaveQuizResult,
  onCloseQuiz
}: ActiveQuizProps) {
  // Participant State
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Quiz Game State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: string }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(0);
  const quizTimerRef = useRef<any>(null);
  const [timeTaken, setTimeTaken] = useState(0);

  // Audio Playback
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeVoice, setActiveVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [autoSpeakQuestion, setAutoSpeakQuestion] = useState<boolean>(true);
  const [isReadingParagraph, setIsReadingParagraph] = useState<boolean>(false);

  const speakParagraph = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isReadingParagraph) {
      window.speechSynthesis.cancel();
      setIsReadingParagraph(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any other speak
    setIsReadingParagraph(true);

    const utterance = new SpeechSynthesisUtterance(quiz.paragraph);
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    utterance.rate = 0.95;

    utterance.onend = () => {
      setIsReadingParagraph(false);
    };
    utterance.onerror = () => {
      setIsReadingParagraph(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Load Speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        const englishVoice = availableVoices.find(v => 
          v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural"))
        ) || availableVoices.find(v => v.lang.startsWith("en")) || availableVoices[0];
        if (englishVoice) {
          setActiveVoice(englishVoice);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Set default participant if any exist
    if (participants.length > 0) {
      const first = participants[0];
      setSelectedParticipantId(first.id);
      setSearchTerm(`${first.id} - ${first.name}`);
    }

    return () => {
      // Cleanup speak on unmount
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, []);

  // Sync state if selectedParticipantId changes
  useEffect(() => {
    if (selectedParticipantId) {
      const p = participants.find(item => item.id === selectedParticipantId);
      if (p) {
        setSearchTerm(`${p.id} - ${p.name}`);
      }
    } else {
      setSearchTerm("");
    }
  }, [selectedParticipantId, participants]);

  const activeQuestion = quiz.questions[currentQuestionIndex];

  // Auto playback when question changes
  useEffect(() => {
    if (quizStarted && activeQuestion && autoSpeakQuestion) {
      speakQuestion(activeQuestion);
    }
  }, [currentQuestionIndex, quizStarted]);

  // Speaks current question and choices
  const speakQuestion = (question: QuizQuestion) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop talking first

    // Assemble text to speak
    const choicesText = question.choices.map((choice, idx) => `Choice ${idx + 1}: ${choice}`).join(". ");
    const speechText = `Question ${currentQuestionIndex + 1}. ${question.text}. ${choicesText}`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    utterance.rate = 0.95; // Slightly slower for comprehension
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  const startQuizSession = () => {
    if (!selectedParticipantId) return;
    
    // Stop active reading if running
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsReadingParagraph(false);

    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setTimeTaken(0);

    // Track timer
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    quizTimerRef.current = setInterval(() => {
      setTimeTaken(prev => prev + 1);
    }, 1000);
  };

  const selectAnswer = (choice: string) => {
    if (quizCompleted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [activeQuestion.id]: choice
    }));
  };

  // Next or Complete
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    if (quizTimerRef.current) clearInterval(quizTimerRef.current);

    // Compute metrics
    let finalScore = 0;
    let totalPointsAvailable = 0;

    quiz.questions.forEach((q) => {
      totalPointsAvailable += q.points;
      const userAns = selectedAnswers[q.id];
      if (userAns === q.correctAnswer) {
        finalScore += q.points;
      }
    });

    const percentage = Math.round((finalScore / totalPointsAvailable) * 100) || 0;
    const passed = percentage >= 80; // 80% passing score limit

    const participant = participants.find(p => p.id === selectedParticipantId);
    
    // Create new result
    const result: QuizResult = {
      id: "res-" + Date.now(),
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizCategory: quiz.category,
      participantId: selectedParticipantId,
      participantName: participant ? participant.name : "Anonymous",
      score: finalScore,
      totalPoints: totalPointsAvailable,
      percentage,
      passed,
      timeTakenSeconds: timeTaken,
      date: new Date().toISOString(),
      answers: selectedAnswers
    };

    onSaveQuizResult(result);
    setQuizCompleted(true);

    // Call Speech Synthesis to report score
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const statusText = passed 
        ? `Incredible job, ${result.participantName}! You passed with a score of ${percentage} percent!` 
        : `Keep studying, ${result.participantName}! You scored ${percentage} percent. Try again to boost your score.`;
      speakStatusMsg(statusText);
    }
  };

  const speakStatusMsg = (msg: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(msg);
    if (activeVoice) utterance.voice = activeVoice;
    window.speechSynthesis.speak(utterance);
  };

  const selectedParticipant = participants.find(p => p.id === selectedParticipantId);

  const filteredParticipants = participants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-3xl mx-auto">
      {/* 1. SELECTION SCREEN BEFORE QUIZ */}
      {!quizStarted && (
        <div className="space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-150">{quiz.category}</span>
              <h1 className="text-xl font-bold text-slate-900 mt-2">{quiz.title}</h1>
              <p className="text-xs text-slate-500 mt-1">Contains {quiz.questions.length} evaluate points • Pass threshold: 80%</p>
            </div>
            <button
              id="activequiz-close-btn"
              onClick={onCloseQuiz}
              className="text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl transition bg-slate-50 hover:bg-slate-100"
            >
              Exit Quiz
            </button>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl text-xs text-slate-700 leading-relaxed border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Volume2 size={14} className="text-indigo-600" />
                <span>Source Paragraph Information:</span>
              </h3>
              
              <button
                id="quiz-speak-paragraph-btn"
                type="button"
                onClick={speakParagraph}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-xs cursor-pointer ${
                  isReadingParagraph 
                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100" 
                    : "bg-indigo-600 text-white border-indigo-505 hover:bg-indigo-700"
                }`}
                title={isReadingParagraph ? "Stop oral narrative output" : "Start oral narrative output to listen to the loaded text context before beginning the evaluation"}
              >
                <Volume2 size={13} className={isReadingParagraph ? "animate-bounce" : ""} />
                <span>{isReadingParagraph ? "Stop Reading Aloud" : "Read Paragraph Aloud"}</span>
              </button>
            </div>
            
            <p className="italic font-sans bg-white p-3 rounded-lg border border-slate-100 text-[12px] text-slate-650 leading-relaxed font-medium">"{quiz.paragraph}"</p>
          </div>          {/* Participant selecting flow */}
          <div className="space-y-4">
            <div className="bg-indigo-50/40 rounded-2xl p-6 border border-indigo-100/80">
              <div className="flex items-center space-x-3 text-slate-700 mb-4">
                <Users size={18} className="text-indigo-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Choose Active Participant (Official Roster Only)</h3>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="🔍 Search participant by Name or ID (e.g. Suraj, Manoj, IN006225)..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 pr-10 font-bold shadow-xs transition"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedParticipantId("");
                        setShowDropdown(true);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filtered dropdown list */}
                {showDropdown && (
                  <div className="bg-white border border-slate-200 rounded-xl shadow-lg mt-1 overflow-hidden max-h-56 overflow-y-auto z-20 relative">
                    <div className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
                      <span>Matches ({filteredParticipants.length} of {participants.length})</span>
                      <button 
                        type="button"
                        onClick={() => setShowDropdown(false)} 
                        className="text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        Minimize
                      </button>
                    </div>
                    {filteredParticipants.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {filteredParticipants.map((p) => {
                          const isSelected = p.id === selectedParticipantId;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedParticipantId(p.id);
                                setSearchTerm(`${p.id} - ${p.name}`);
                                setShowDropdown(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs flex justify-between items-center transition ${
                                isSelected 
                                  ? "bg-indigo-50/80 text-indigo-950 font-bold" 
                                  : "hover:bg-indigo-50/30 text-slate-700"
                              }`}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] border border-indigo-100">{p.id}</span>
                                <span className={isSelected ? "font-bold" : "font-medium"}>{p.name}</span>
                              </div>
                              {isSelected ? (
                                <span className="text-indigo-600 font-bold flex items-center space-x-1">
                                  <span>✓ Selected</span>
                                </span>
                              ) : (
                                <span className="text-slate-300 text-[10px]">Select</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 italic bg-white">
                        No official participant matching "{searchTerm}" found in roster.
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Participant Card */}
                {selectedParticipant && (
                  <div className="bg-indigo-50 text-indigo-950 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs animate-fadeIn mt-1.5 shadow-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {selectedParticipant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{selectedParticipant.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">ID Ref No: <strong className="text-indigo-700 font-bold">{selectedParticipant.id}</strong></p>
                      </div>
                    </div>
                    <span className="bg-indigo-100 text-indigo-805 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-indigo-200">
                      Authorized Active User
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Accessibility Audio Option before starting */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Volume2 size={16} className="text-slate-400" />
                <span>Default voice feedback options</span>
              </div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSpeakQuestion}
                  onChange={(e) => setAutoSpeakQuestion(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span className="text-slate-500 pr-1">Read question narration on change</span>
              </label>
            </div>
          </div>

          <button
            id="start-quiz-btn"
            disabled={!selectedParticipantId}
            onClick={startQuizSession}
            className="w-full bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white rounded-xl py-3 text-xs font-semibold shadow-md transition disabled:bg-slate-100 disabled:text-slate-400 disabled:border-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Play size={13} className="fill-white" />
            <span>Launch Quiz Session ({selectedParticipant?.name || "No User Selected"})</span>
          </button>
        </div>
      )}

      {/* 2. ACTIVE PROGRESSIVE GAMEPLAY */}
      {quizStarted && !quizCompleted && (
        <div className="space-y-6">
          {/* Header Progress status */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <div>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Participant: {selectedParticipant?.name}</p>
              <h2 className="text-xs font-bold text-slate-800 truncate max-w-[400px] mt-0.5">Evaluating: {quiz.title}</h2>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-mono text-slate-500">Time Running: <strong className="text-slate-800 font-bold">{timeTaken}s</strong></span>
              <button
                id="quit-quiz-midway-btn"
                onClick={() => {
                  if (confirm("Are you sure you want to stop this user's evaluation? Results will not be stored.")) {
                    setQuizStarted(false);
                    if (typeof window !== "undefined" && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                    }
                  }
                }}
                className="text-rose-600 text-xs font-semibold py-1 px-2.5 rounded hover:bg-rose-50 transition"
              >
                Quit Session
              </button>
            </div>
          </div>

          {/* Progress Bar indicator */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            />
          </div>

          {/* Question card */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                Point {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-mono">{activeQuestion.points} pts</span>
                {/* Voice Narration helper */}
                <button
                  id={`narrate-q-${activeQuestion.id}`}
                  onClick={() => speakQuestion(activeQuestion)}
                  className="bg-white hover:bg-slate-100 border border-slate-200 rounded-lg p-1.5 text-slate-500 hover:text-indigo-600 transition"
                  title="Narrate Question aloud (Accessibility)"
                >
                  <Volume2 size={13} />
                </button>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-900 leading-relaxed font-sans mb-6">
              {activeQuestion.text}
            </p>

            {/* Answer Options Radio/Buttons */}
            <div className="grid grid-cols-1 gap-3">
              {activeQuestion.choices.map((choice, i) => {
                const letter = ["A", "B", "C", "D"][i] || "-";
                const isSelected = selectedAnswers[activeQuestion.id] === choice;

                return (
                  <button
                    key={i}
                    id={`choice-bubble-${i}`}
                    type="button"
                    onClick={() => selectAnswer(choice)}
                    className={`text-left p-3.5 rounded-xl text-xs transition-all border flex items-center space-x-3 cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/80 border-2 border-indigo-600 text-indigo-950 shadow-sm font-semibold"
                        : "bg-white border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-700"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center font-mono ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1 font-medium">{choice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation drawer inside quiz */}
          <div className="flex justify-between items-center pt-2">
            <button
              id="quiz-prev-btn"
              disabled={currentQuestionIndex === 0}
              onClick={handlePrev}
              className="border border-slate-200 text-xs px-4 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center space-x-1"
            >
              <ArrowLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              id="quiz-next-btn"
              disabled={!selectedAnswers[activeQuestion.id]}
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <span>{currentQuestionIndex === quiz.questions.length - 1 ? "Submit Answers" : "Next Point"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 3. POST-QUIZ RESULTS SCREEN */}
      {quizCompleted && (
        <div className="space-y-6">
          {/* Main Grade Box */}
          {(() => {
            let ptsScored = 0;
            let totalAvailable = 0;
            quiz.questions.forEach((q) => {
              totalAvailable += q.points;
              const choiceSelected = selectedAnswers[q.id];
              if (choiceSelected === q.correctAnswer) ptsScored += q.points;
            });
            const percent = Math.round((ptsScored / totalAvailable) * 100) || 0;
            const passed = percent >= 80;

            return (
              <div className={`p-6 rounded-2xl text-center space-y-3 relative overflow-hidden border ${
                passed 
                  ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                  : "bg-rose-50/50 border-rose-100 text-rose-800"
              }`}>
                <div className="flex justify-center mb-1">
                  {passed ? (
                    <div className="bg-emerald-500 text-white rounded-full p-2.5 shadow animate-bounce">
                      <Award size={28} />
                    </div>
                  ) : (
                    <div className="bg-rose-500 text-white rounded-full p-2.5 shadow">
                      <AlertTriangle size={28} />
                    </div>
                  )}
                </div>

                <p className="text-[10px] uppercase font-bold font-mono tracking-widest text-slate-400"> quiz status report</p>
                <h1 className="text-2xl font-black tracking-tight">{percent}% Correct Answers</h1>

                <div className="text-slate-700 text-xs space-y-1">
                  <p>Congratulations, <strong className="font-semibold">{selectedParticipant?.name}</strong>!</p>
                  <p>
                    You scored <strong className="font-semibold">{ptsScored} / {totalAvailable} points</strong> in a total duration of <strong className="font-semibold">{timeTaken} seconds</strong>.
                  </p>
                  <span className={`inline-block text-[11px] font-bold px-3 py-1 rounded-full mt-2 ${
                    passed ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}>
                    {passed ? "⭐ PASSED" : "❌ FAILED"}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Solutions list / Explanations from the quiz */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>📝 Detailed Solutions & Performance Review</span>
            </h3>

            <div className="space-y-4">
              {quiz.questions.map((question, qIdx) => {
                const userAns = selectedAnswers[question.id];
                const isCorrect = userAns === question.correctAnswer;

                return (
                  <div key={question.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40 text-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-slate-800 leading-relaxed pr-6">
                        {qIdx + 1}. {question.text}
                      </h4>
                      {isCorrect ? (
                        <span className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-medium">
                          <CheckCircle size={11} />
                          <span>Correct</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1.5 text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded font-medium">
                          <XCircle size={11} />
                          <span>Incorrect</span>
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <p className="bg-white border rounded-lg p-2 text-slate-600">
                        <strong className="text-slate-500 block text-[10px] uppercase font-mono mb-0.5">Your answer:</strong>
                        <span className={`${isCorrect ? "text-emerald-700 font-medium" : "text-rose-700"}`}>
                          {userAns || "(Skipped)"}
                        </span>
                      </p>
                      <p className="bg-white border rounded-lg p-2 text-slate-600">
                        <strong className="text-slate-500 block text-[10px] uppercase font-mono mb-0.5">Correct response:</strong>
                        <span className="text-emerald-700 font-medium">{question.correctAnswer}</span>
                      </p>
                    </div>

                    <div className="bg-indigo-50/50 p-2.5 rounded-lg text-slate-600 leading-relaxed">
                      <strong className="text-indigo-600 text-[10px] font-bold uppercase font-mono block mb-1">
                        Ai tutor explanation:
                      </strong>
                      <p className="text-slate-700 italic">{question.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-50">
            <button
              id="quiz-complete-dismiss-btn"
              onClick={onCloseQuiz}
              className="bg-slate-800 hover:bg-slate-900 border border-slate-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
            >
              Done Reviewing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
