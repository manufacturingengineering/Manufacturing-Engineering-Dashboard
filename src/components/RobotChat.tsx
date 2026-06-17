import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, HelpCircle, Sparkles, Volume2, Bot, Play, Brain, Settings, Upload } from "lucide-react";
import { ChatMessage, RobotState, Quiz } from "../types";
import * as XLSX from "xlsx";

interface RobotChatProps {
  onGenerateQuiz: (paragraph: string, category?: string, questionCount?: number) => Promise<void>;
  onNavigateToQuiz: (quiz: Quiz) => void;
  onNavigateToTab: (tab: string) => void;
  latestQuiz: Quiz | null;
  activeParagraph: string;
  setActiveParagraph: (p: string) => void;
}

export default function RobotChat({
  onGenerateQuiz,
  onNavigateToQuiz,
  onNavigateToTab,
  latestQuiz,
  activeParagraph,
  setActiveParagraph
}: RobotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "robot",
      text: "Hello! I am **Siri**, your AI Voice assistant. You can chat with me or speak commands like **'generate quiz'** or **'show history'**. Paste any paragraph on the side or ask me to generate a template quiz!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Voice controls
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [pitch, setPitch] = useState<number>(1.1);
  const [rate, setRate] = useState<number>(1.0);
  const [autoSpeakRobot, setAutoSpeakRobot] = useState<boolean>(true);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [quizQuestionCount, setQuizQuestionCount] = useState<number>(10);
  const [isReadingExcel, setIsReadingExcel] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested paragraphs for quick onboarding
  const templates = [
    {
      title: "Pneumatic Trans ⚙️",
      category: "Pneumatic Transmission",
      text: "Pneumatic transmission systems use pressurized gas, typically compressed air, to transmit and control power in mechanical applications. Key components include an air compressor to increase pressure, a receiver tank for storage, filter-regulator-lubricator (FRL) units for conditioning, directional control valves to guide flow, and cylinders/actuators to perform work. Because air is compressible and readily available, pneumatics offers safe, clean, reliable, and high-speed linear motion, although it is less efficient for heavy forces compared to hydraulic transmissions."
    },
    {
      title: "TPM Basic 🛠️",
      category: "TPM",
      text: "Total Productive Maintenance (TPM) is a holistic approach to equipment upkeep that strives to achieve perfect production with zero breakdowns, zero slow-downs, and zero accidents. Developed in Japan, TPM is built on eight foundational pillars, with Autonomous Maintenance (Jishu Hozen) being central, empowering operators to maintain their own machinery. By introducing proactive and preventative techniques, TPM maximizes overall equipment effectiveness (OEE) and fosters a culture of shared responsibility between operators and maintenance teams."
    },
    {
      title: "PLC Basic 🔌",
      category: "PLC Basic",
      text: "A Programmable Logic Controller (PLC) is an industrial solid-state computer designed to continuously monitor inputs from sensors and make logic-based decisions to control output devices like motors and valves. Standard PLC operations follow a repetitive scan cycle consisting of three main phases: reading input terminal status, executing the programmed control logic, and updating output devices. PLCs are highly robust, noise-resistant, and commonly programmed using Ladder Logic, which visually mimics electrical relay wiring diagrams."
    },
    {
      title: "CPU brain 💻",
      category: "CPU",
      text: "The Central Processing Unit (CPU) is the primary component of a computer that acts as its brain to execute program instructions. A CPU consists of three core units: the Arithmetic Logic Unit (ALU) which performs math and logical operations, the Control Unit (CU) which directs the flow of signals, and Registers for high-speed temporary storage. Operating through the fundamental instruction cycle of Fetch, Decode, and Execute, the CPU coordinates all hardware components and regulates system processing speed measured in gigahertz clocks."
    },
    {
      title: "Photosynthesis 🌱",
      category: "Science",
      text: "Photosynthesis is the process used by plants, algae, and certain bacteria to harness celestial sunlight and convert it into chemical energy. During this biochemical reaction, carbon dioxide and water are combined to synthesize glucose molecules, releasing oxygen gaseous molecules as an essential byproduct. This magical reaction primarily takes place inside specialized organelles called chloroplasts, which contain pigment chlorophyll."
    },
    {
      title: "Artificial Intelligence 🤖",
      category: "Technology",
      text: "Artificial intelligence (AI) represents the simulation of human intelligence processes by computer systems. These actions encompass cognitive learning (the acquisition of raw rules and information for processing), reasoning (using system rules to reach approximate conclusions), and self-correction. Breakthroughs in Deep Learning neural networks have allowed modern AI models to surpass humans in pattern recognition and language processing tasks."
    }
  ];

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    // 1. Synth
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Pick a default friendly voice
        const englishVoice = availableVoices.find(v => 
          v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha"))
        ) || availableVoices.find(v => v.lang.startsWith("en")) || availableVoices[0];
        
        if (englishVoice) {
          setSelectedVoice(englishVoice.name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // 2. Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        setRobotState("listening");
        setErrorMessage("");
      };

      rec.onresult = (event: any) => {
        const textResult = event.results[0][0].transcript;
        if (textResult) {
          handleUserMessage(textResult, "voice");
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMessage("Microphone access denied. Please approve mic permissions.");
        } else {
          setErrorMessage(`Speech error: ${event.error}`);
        }
        setRobotState("idle");
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
        if (robotState === "listening") {
          setRobotState("idle");
        }
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Sync scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Read aloud robot text (accessibility)
  const speakText = (textToSpeak: string, onEndCallback?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }
    
    // Stop any active speak
    window.speechSynthesis.cancel();

    // Strip markdown bold and asterisks for a clean speech flow
    const cleanText = textToSpeak
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .replace(/🌱|🤖|🚀|📊|💡|⚙️|📝/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    if (selectedVoice) {
      const match = voices.find(v => v.name === selectedVoice);
      if (match) utterance.voice = match;
    }
    
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => {
      setRobotState("speaking");
    };

    utterance.onend = () => {
      setRobotState("idle");
      if (onEndCallback) {
        onEndCallback();
      }
    };

    utterance.onerror = () => {
      setRobotState("idle");
      if (onEndCallback) {
        onEndCallback();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle voice capture
  const toggleListening = () => {
    if (!isSpeechSupported) {
      setErrorMessage("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        // Cancel active speak before starting to listen
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        setRobotState("idle");
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  };

  // Handle Excel file uploads and cell content parsing
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingExcel(true);
    setErrorMessage("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const resultVal = evt.target?.result;
        if (!resultVal) {
          throw new Error("Could not read uploaded file content.");
        }
        const data = new Uint8Array(resultVal as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        
        let compiledContent = "";
        
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
          
          if (rows && rows.length > 0) {
            compiledContent += `[Sheet: ${sheetName}]\n`;
            rows.forEach((row, rIdx) => {
              if (row && row.length > 0) {
                const filteredRow = row
                  .map(cell => (cell !== null && cell !== undefined) ? String(cell).trim() : "")
                  .filter(cellVal => cellVal.length > 0);
                
                if (filteredRow.length > 0) {
                  compiledContent += `Row ${rIdx + 1}: ${filteredRow.join(" | ")}\n`;
                }
              }
            });
            compiledContent += "\n";
          }
        });

        const trimmedContent = compiledContent.trim();
        if (!trimmedContent) {
          throw new Error("The uploaded Excel file appears to be empty or has incompatible cell formats.");
        }

        setActiveParagraph(trimmedContent);
        
        addRobotMessage(`Successfully parsed Excel spreadsheet **"${file.name}"**! Standardized table cells have been set inside your source paragraph box below. Please select your desired question limit and click **Auto-Generate Multiple Point Quiz**.`);
        speakText(`Excel sheet parsed successfully. Adjust the questions limit and click generate.`);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(`Error parsing Excel sheet: ${err.message || "Invalid file format or cell values"}`);
      } finally {
        setIsReadingExcel(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    reader.onerror = () => {
      setErrorMessage("Failed to read the selected Excel file.");
      setIsReadingExcel(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Execute native command handlers
  const processVoiceCommands = (text: string): boolean => {
    const cmd = text.toLowerCase().trim();

    // Command matching helpers
    if (cmd.includes("generate quiz") || cmd.includes("make quiz") || cmd.includes("create quiz")) {
      setRobotState("thinking");
      speakText("Perfect! Let me generate a brand new quiz based on our loaded paragraph right away.");
      
      const targetParagraph = activeParagraph || templates[0].text;
      if (!activeParagraph) {
        setActiveParagraph(templates[0].text);
      }

      onGenerateQuiz(targetParagraph, undefined, quizQuestionCount)
        .then(() => {
          setRobotState("idle");
          addRobotMessage("The quiz has successfully been generated based on our paragraph! You are ready to start now!");
          if (autoSpeakRobot) {
            speakText("Interactive quiz successfully generated! Tap 'Start Loaded Quiz' to test your comprehension.");
          }
        })
        .catch((err) => {
          setRobotState("idle");
          setErrorMessage(`Failed to generate quiz automatically: ${err.message}`);
        });
      return true;
    }

    if (cmd.includes("show dashboard") || cmd.includes("view analytics") || cmd.includes("open dashboard") || cmd.includes("track improvement")) {
      onNavigateToTab("analytics");
      speakText("Opening the detailed performance analytics dashboard.");
      addRobotMessage("Here is your detailed performance analytics dashboard. Take a look at your stats!");
      return true;
    }

    if (cmd.includes("show history") || cmd.includes("open history") || cmd.includes("view logs") || cmd.includes("review quizzes")) {
      onNavigateToTab("history");
      speakText("Opening the categorized quiz history log.");
      addRobotMessage("Opening your history logs showing all generated quizzes!");
      return true;
    }

    if (cmd.includes("start quiz") || cmd.includes("take quiz") || cmd.includes("perform quiz")) {
      if (latestQuiz) {
        onNavigateToQuiz(latestQuiz);
        speakText("Beginning the quiz performance mode. Good luck!");
        addRobotMessage(`Starting quiz "${latestQuiz.title}" now.`);
      } else {
        speakText("I don't see any loaded quiz yet. Let's write or select a paragraph, then say 'generate quiz' first!");
        addRobotMessage("There is no active quiz generated yet. Please generate a quiz from a paragraph first.");
      }
      return true;
    }

    if (cmd.startsWith("select template") || cmd.includes("load template")) {
      let idx = 0;
      if (cmd.includes("tpm") || cmd.includes("maintenance") || cmd.includes("two")) {
        idx = 1;
      } else if (cmd.includes("plc") || cmd.includes("basic") || cmd.includes("three")) {
        idx = 2;
      } else if (cmd.includes("cpu") || cmd.includes("brain") || cmd.includes("four")) {
        idx = 3;
      } else if (cmd.includes("photosynthesis") || cmd.includes("science") || cmd.includes("five")) {
        idx = 4;
      } else if (cmd.includes("artificial") || cmd.includes("technology") || cmd.includes("six")) {
        idx = 5;
      }
      const templ = templates[idx] || templates[0];
      setActiveParagraph(templ.text);
      speakText(`Loaded the template ${templ.title}. You can now say 'generate quiz' to create the game!`);
      addRobotMessage(`Loaded template **${templ.title}**. Ask me to 'generate quiz' verbally or click below to build it!`);
      return true;
    }

    if (cmd.includes("stop") || cmd.includes("mute") || cmd.includes("shut up") || cmd.includes("cancel")) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setRobotState("idle");
      addRobotMessage("Muted. I have cancelled the speech output.");
      return true;
    }

    return false; // Not a native system shortcut, pass to general Gemini chat
  };

  // Add messages
  const addRobotMessage = (text: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "robot",
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Trigger Gemini API call or perform local commands
  const handleUserMessage = async (text: string, type: "text" | "voice" = "text") => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setRobotState("thinking");

    // 2. Check if text is a direct voice utility command
    const isCommand = processVoiceCommands(text);
    if (isCommand) {
      return;
    }

    // 3. Fallback: Call our Gemini Chat Express backend
    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.sender === "robot" ? "assistant" : "user",
            content: m.text
          })),
          currentParagraph: activeParagraph
        })
      });

      const data = await response.json();
      setRobotState("idle");

      if (data.success && data.reply) {
        addRobotMessage(data.reply);
        if (autoSpeakRobot) {
          speakText(data.reply);
        }
      } else {
        const errText = data.error || "Sorry, I had trouble thinking about that. Please try again.";
        addRobotMessage(errText);
        if (autoSpeakRobot) {
          speakText(errText);
        }
      }
    } catch (err: any) {
      console.error(err);
      setRobotState("idle");
      const errText = "I lost connection to my AI thinking centers on the server. Please verify your internet connection or API Key configuration.";
      addRobotMessage(errText);
      if (autoSpeakRobot) {
        speakText(errText);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full items-start">
      {/* LEFT COLUMN: The Robot Avatar & Prompt Builder */}
      <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-full space-y-6">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  robotState === "listening" ? "bg-rose-400" : robotState === "thinking" ? "bg-amber-400" : "bg-indigo-400"
                }`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${
                  robotState === "listening" ? "bg-rose-500" : robotState === "thinking" ? "bg-amber-500" : "bg-indigo-600"
                }`}></span>
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-950">Siri Voice Assistant</h2>
                <p className="text-[11px] text-slate-500 capitalize tracking-tight font-medium">Status: {robotState}</p>
              </div>
            </div>

            <button
              id="voice-settings-toggle-btn"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
              title="Voice Customization"
            >
              <Settings size={16} />
            </button>
          </div>

          {/* Voice Settings dropdown */}
          {showVoiceSettings && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Audio Customization</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoSpeakRobot}
                    onChange={(e) => setAutoSpeakRobot(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">Auto vocalize answers</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">Robot Voice Match:</label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-700 outline-none text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  {voices.map((v, i) => (
                    <option key={i} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                  {voices.length === 0 && <option>Default Browser Voice</option>}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between mb-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Speed (Rate)</span>
                    <span className="text-slate-800 font-bold">{rate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1 text-[11px]">
                    <span className="text-slate-500 font-medium">Pitch Accent</span>
                    <span className="text-slate-800 font-bold">{pitch}</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Interactive Visual Avatar Block */}
          <div className="mt-6 flex flex-col items-center justify-center py-8 bg-slate-50 rounded-2xl border border-slate-200 relative overflow-hidden shadow-inner">
            {/* Pulsing state ring */}
            <div className={`absolute w-44 h-44 rounded-full border transition-all duration-700 pointer-events-none flex items-center justify-center ${
              robotState === "listening" ? "ring-4 ring-rose-100 border-rose-300 animate-pulse" :
              robotState === "thinking" ? "ring-4 ring-amber-100 border-amber-300 rotate-180 animate-spin" :
              robotState === "speaking" ? "ring-4 ring-indigo-100 border-indigo-200" : "border-slate-200"
            }`} />

            {/* Siri's Body Face */}
            <div className={`w-28 h-28 rounded-full shadow-md flex flex-col items-center justify-center relative transition-all duration-300 ${
              robotState === "listening" ? "bg-rose-500 text-white" :
              robotState === "thinking" ? "bg-amber-500 text-white" :
              robotState === "speaking" ? "bg-indigo-600 text-white animate-bounce" : "bg-slate-900 text-white"
            }`}>
              {/* Ears */}
              <div className="absolute -left-2 top-11 w-3 h-6 rounded-l-full bg-inherit brightness-95" />
              <div className="absolute -right-2 top-11 w-3 h-6 rounded-r-full bg-inherit brightness-95" />
              
              {/* Eyes */}
              <div className="flex space-x-6 mb-3 z-10">
                <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 ${
                  robotState === "looking" ? "scale-y-50" :
                  robotState === "listening" ? "animate-pulse scale-x-125" :
                  robotState === "thinking" ? "animate-bounce" : "scale-y-100"
                }`} />
                <span className={`w-3.5 h-3.5 rounded-full bg-white transition-all duration-300 ${
                  robotState === "looking" ? "scale-y-50" :
                  robotState === "listening" ? "animate-pulse scale-x-125" :
                  robotState === "thinking" ? "animate-bounce" : "scale-y-100"
                }`} />
              </div>

              {/* Smiling Mouth */}
              <div className={`w-10 h-3 rounded-full border-t-0 border-white relative transition-all duration-300 ${
                robotState === "speaking" ? "h-6 bg-amber-200 border-4 rounded-full border-indigo-900" :
                robotState === "thinking" ? "w-4 h-1 border-b bg-white" :
                robotState === "listening" ? "w-8 h-4 border-2 border-b-2 rounded-full border-t-white" : "border-b-4"
              }`} />
            </div>

            {/* Micro Waveforms */}
            <div className="mt-6 flex items-center justify-center space-x-1.5 h-8">
              {[...Array(6)].map((_, i) => (
                <span
                  key={i}
                  style={{
                    animationDelay: `${i * 120}ms`,
                    height: robotState === "listening" ? "24px" : robotState === "speaking" ? "18px" : "4px"
                  }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    robotState === "listening" ? "bg-rose-500 animate-pulse" :
                    robotState === "speaking" ? "bg-indigo-600 animate-pulse" : "bg-slate-300"
                  }`}
                />
              ))}
            </div>

            {/* Guide Help info */}
            <div className="mt-4 text-[11px] text-center text-slate-500 px-6 font-mono leading-relaxed font-medium">
              {robotState === "listening" ? "Speak clearly: 'generate quiz', 'open history'..." : 
               robotState === "speaking" ? "Vocalizing speech response... Click to interrupt." :
               "Hold mic or chat to speak commands."}
            </div>
          </div>
        </div>

        {/* Input Paragraph text area for generation */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Brain size={14} className="text-indigo-600" />
              Source Information Paragraph
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                {activeParagraph.length} chars
              </span>
            </div>
          </div>

          <textarea
            value={activeParagraph}
            onChange={(e) => setActiveParagraph(e.target.value)}
            placeholder="Type or paste a paragraph about any theme here..."
            className="w-full h-32 text-xs border border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans text-slate-600 resize-none leading-relaxed"
          />

          {/* Quick template pickers */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {templates.map((templ, idx) => (
              <button
                key={idx}
                id={`template-btn-${idx}`}
                onClick={() => {
                  setActiveParagraph(templ.text);
                  speakText(`Loaded ${templ.title}. Let's make a quiz on it!`);
                }}
                className="text-[11px] bg-slate-100 font-medium hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-slate-600 rounded-lg px-2.5 py-1 transition flex items-center space-x-1"
              >
                <span>{templ.title}</span>
              </button>
            ))}
          </div>

          {/* AI Excel Intelligence Hub & Question Limit Configurator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                Questions Required:
              </label>
              <select
                id="generation-question-count-select"
                value={quizQuestionCount}
                onChange={(e) => setQuizQuestionCount(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg text-xs font-semibold px-2 py-1 text-slate-700 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                id="excel-file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isReadingExcel || robotState === "thinking"}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg py-2 px-3 text-xs font-semibold tracking-tight transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Upload spreadsheet (.xlsx, .xls) to parse rows into training context"
              >
                <Upload size={13} className={isReadingExcel ? "animate-bounce" : ""} />
                <span>{isReadingExcel ? "Parsing Excel..." : "Upload Excel Sheet"}</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleExcelUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
            </div>
          </div>

          {/* Trigger Generate Workflow Buttons */}
          <div className="flex flex-col gap-2.5">
            <button
              id="builder-generate-quiz-btn"
              disabled={robotState === "thinking" || activeParagraph.trim().length < 20}
              onClick={() => {
                setRobotState("thinking");
                onGenerateQuiz(activeParagraph, undefined, quizQuestionCount)
                  .then(() => {
                    setRobotState("idle");
                    addRobotMessage(`I've finished analyzing your custom contents and successfully created the ${quizQuestionCount}-question evaluation quiz. Have fun playing!`);
                    speakText(`Amazing! Multiple point question evaluation is ready. Tap start!`);
                  })
                  .catch((err) => {
                    setRobotState("idle");
                    setErrorMessage(err.message || "Could not generate.");
                  });
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl py-2.5 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
            >
              <Sparkles size={14} className={robotState === "thinking" ? "animate-spin" : ""} />
              <span>{robotState === "thinking" ? "Creating Multi-point Quiz..." : `Auto-Generate ${quizQuestionCount}-Point Quiz`}</span>
            </button>
          </div>

          {latestQuiz && (
            <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-indigo-400 uppercase font-mono font-bold tracking-wider">Active Loaded Quiz</p>
                <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">{latestQuiz.title}</p>
              </div>
              <button
                id="bot-start-quiz-btn"
                onClick={() => onNavigateToQuiz(latestQuiz)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold tracking-wide py-1.5 px-3 rounded-lg transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Play size={10} className="fill-white" />
                <span>Start Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Log Interface */}
      <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between h-[620px]">
        {/* Header Title */}
        <div className="border-b border-slate-200 pb-3 flex items-center space-x-2.5 justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="text-indigo-600" size={20} />
            <div>
              <h2 className="text-sm font-bold text-slate-900">Siri Voice Chat & Commands</h2>
              <p className="text-[11px] text-slate-500">Ask questions, issue instructions, or parse voice requests</p>
            </div>
          </div>
          <button
            id="clear-chat-btn"
            onClick={() => setMessages([{
              id: "msg-1",
              sender: "robot",
              text: "Hello! I am **Siri**, your AI Voice assistant. You can chat with me or speak commands like **'generate quiz'** or **'show history'**.",
              timestamp: new Date().toLocaleTimeString([])
            }])}
            className="text-[11px] text-slate-400 hover:text-slate-700 hover:bg-slate-50 px-2 py-1 rounded"
          >
            Clear Conversation
          </button>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1 font-mono">
                <span>{msg.sender === "user" ? "You" : "Siri"}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.type === "voice" && <span className="bg-rose-50 text-rose-600 px-1 rounded border border-rose-150">via Voice</span>}
              </div>

              <div className={`p-3.5 max-w-[85%] rounded-2xl text-xs leading-relaxed ${
                msg.sender === "user" 
                  ? "bg-slate-900 border border-slate-800 text-white rounded-tr-none shadow-sm" 
                  : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-sans"
              }`}>
                {msg.text.split("\n").map((line, i) => {
                  // Basic rendering of bold indicators for display
                  let rendered = line;
                  const parts = [];
                  let textLeft = line;
                  const regex = /\*\*(.*?)\*\*/g;
                  let match;
                  let lastIdx = 0;

                  while ((match = regex.exec(line)) !== null) {
                    parts.push(line.substring(lastIdx, match.index));
                    parts.push(<strong key={match.index} className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">{match[1]}</strong>);
                    lastIdx = regex.lastIndex;
                  }
                  parts.push(line.substring(lastIdx));

                  return (
                    <p key={i} className="mb-1.5 last:mb-0">
                      {parts.length > 1 ? parts : line}
                    </p>
                  );
                })}

                {/* Additional utility indicators */}
                {msg.sender === "robot" && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-end">
                    <button
                      id={`read-aloud-${msg.id}`}
                      onClick={() => speakText(msg.text)}
                      className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-1 p-1 hover:bg-indigo-50 rounded"
                    >
                      <Volume2 size={11} />
                      <span>Read Aloud</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {robotState === "thinking" && (
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-1 px-1 font-mono">
                <span>Siri</span>
                <span>•</span>
                <span>thinking...</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl text-xs rounded-tl-none p-4 max-w-[85%] shadow-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-[11px] font-mono pl-1 text-slate-400">analyzing cognitive query...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Feedback / Error Message bar */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-150 text-rose-600 p-2.5 rounded-xl text-[11px] mb-2 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button id="close-err-btn" onClick={() => setErrorMessage("")} className="font-bold hover:scale-115">×</button>
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-200 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim()) {
                handleUserMessage(inputText, "text");
              }
            }}
            className="flex items-center space-x-2"
          >
            {/* Audio Speech Mic Button */}
            <button
              id="voice-chat-mic-btn"
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all shadow-sm relative ${
                isListening 
                  ? "bg-rose-500 text-white hover:bg-rose-600 scale-105" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
              }`}
              title={isListening ? "Stop Listening" : "Speak Voice Command"}
            >
              {isListening ? (
                <>
                  <MicOff size={18} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
                </>
              ) : (
                <Mic size={18} />
              )}
            </button>

            {/* Input Element */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Siri or type voice command 'generate quiz' or 'start quiz'..."
              className="flex-1 bg-slate-50 text-slate-700 placeholder-slate-400 text-xs rounded-xl p-3 border border-slate-200 outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
            />

            {/* Send Button */}
            <button
              id="send-chat-msg-btn"
              disabled={!inputText.trim() || robotState === "thinking"}
              type="submit"
              className="bg-slate-900 border border-slate-800 text-white hover:bg-indigo-600 p-3 rounded-xl transition disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Quick instructions cheat sheet */}
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
            <span className="flex items-center gap-1 font-medium text-slate-500">
              <HelpCircle size={12} className="text-slate-400" />
              Commands cheat:
            </span>
            <div className="flex gap-1.5 overflow-x-auto">
              {["generate quiz", "start quiz", "show history", "show dashboard"].map((c, i) => (
                <button
                  key={i}
                  id={`chip-cmd-${i}`}
                  type="button"
                  onClick={() => handleUserMessage(c, "text")}
                  className="hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 text-slate-500 rounded px-1.5 font-semibold text-[10px] cursor-pointer"
                >
                  "{c}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
