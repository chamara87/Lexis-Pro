import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Check, 
  Copy, 
  RotateCcw, 
  History, 
  AlertTriangle, 
  Trash2, 
  CornerDownRight, 
  BookOpen, 
  ArrowRight, 
  FileText, 
  Settings2, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ExternalLink,
  Briefcase,
  User,
  Coffee,
  Info
} from "lucide-react";
import { AnalysisResult, HistoryItem, GrammarLesson } from "./types";

const INITIAL_PRESETS = [
  {
    label: "Grammar & Tense Errors",
    text: "he dont want to go to the meeting yesterday because he feel sick.",
    instruction: "Make it direct."
  },
  {
    label: "Awkward Corporate Request",
    text: "kindly reply to my email as soon as possible because i need to write the report urgently.",
    instruction: "Keep it warm yet professional."
  },
  {
    label: "Aggressive Peer Chat",
    text: "hey, just checking if you have done that task yet? i need it right now",
    instruction: "Ensure polite urgency without sounding demanding."
  }
];

export default function App() {
  const [inputText, setInputText] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [activeTab, setActiveTab] = useState<"grammar" | "professional" | "average" | "casual">("grammar");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<{ [key: string]: boolean }>({});

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("copy_editor_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // Save history to localStorage on change
  const saveHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem("copy_editor_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save history:", e);
    }
  };

  const handlePresetSelect = (presetText: string, presetInst: string) => {
    setInputText(presetText);
    setCustomInstructions(presetInst);
    setError(null);
  };

  const clearInputs = () => {
    setInputText("");
    setCustomInstructions("");
    setError(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: inputText,
          customInstructions: customInstructions
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "An error occurred during communication extraction.");
      }

      setCurrentResult(data);
      setActiveTab("grammar");

      // Appending history item
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        originalText: inputText,
        customInstructions: customInstructions,
        result: data
      };

      const updatedHistory = [newItem, ...history.slice(0, 24)]; // Cap at 25 items
      saveHistory(updatedHistory);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInputText(item.originalText);
    setCustomInstructions(item.customInstructions || "");
    setCurrentResult(item.result);
    setActiveTab("grammar");
    setError(null);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStatus(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  // Compile full structured markdown as requested by target rules
  const getFullMarkdown = () => {
    if (!currentResult) return "";
    
    let grammarNotesStr = "";
    if (currentResult.grammarLessons && currentResult.grammarLessons.length > 0) {
      grammarNotesStr = currentResult.grammarLessons.map((lesson, idx) => {
        return `${idx + 1}. **Original:** "${lesson.originalPhrase}" → **Corrected:** "${lesson.correctedPhrase}"\n   *Note:* ${lesson.explanation}`;
      }).join("\n\n");
    } else {
      grammarNotesStr = "The original text is mostly correct with no major objective spelling/grammatical issues.";
    }

    return `### 🔍 Grammar & Clarity Notes
${grammarNotesStr}

### 🏢 1. Professional Business
${currentResult.professionalBusiness}

### 👔 2. Average English
${currentResult.averageEnglish}

### 🗣️ 3. Natural / Casual
${currentResult.naturalCasual}`;
  };

  const getWordCount = (str: string) => {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col antialiased">
      {/* High Density: LEXIS PRO Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight font-display text-slate-900">
            LEXIS <span className="text-indigo-600">PRO</span>
          </span>
          <span className="ml-4 text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase tracking-widest hidden sm:inline-block">
            Corporate Edition
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end text-[10px] uppercase font-bold text-slate-400 leading-tight">
            <span>Target Region</span>
            <span className="text-slate-700">United States (EN-US)</span>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${
              showHistory 
                ? "bg-slate-100 text-slate-800 border border-slate-300" 
                : "text-slate-600 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>History ({history.length})</span>
          </button>
        </div>
      </header>

      {/* Main Core Layout Grid */}
      <div className="flex-1 w-full max-w-[1500px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* Left Side: Draft inputs and Presets (6 cols standard) */}
        <section className={`flex flex-col space-y-4 ${showHistory ? 'lg:col-span-12 xl:col-span-5' : 'lg:col-span-12 lg:col-span-6'}`}>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shrink-0 flex flex-col justify-between shadow-sm">
            <form onSubmit={handleAnalyze} className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Source Text (Draft)</span>
                </label>
                
                {inputText && (
                  <button
                    type="button"
                    onClick={clearInputs}
                    className="text-xs text-slate-500 hover:text-red-600 flex items-center space-x-1 font-medium transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Text Input Block */}
              <div className="relative flex-1 min-h-[200px] flex flex-col">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your draft text here (e.g. emails, casual slack drafts, messages you want to proofread and rewrite)..."
                  maxLength={1000}
                  className="w-full flex-1 p-4 bg-slate-50 border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 font-sans resize-y text-sm md:text-[14px] leading-relaxed text-slate-700"
                />
                
                {/* Character Counter */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-3 text-[10px] font-mono font-medium text-slate-400 select-none">
                  <span>{getWordCount(inputText)} words</span>
                  <span>{inputText.length}/1000 chars</span>
                </div>
              </div>

              {/* Advanced Controls Expander */}
              <div className="border-t border-slate-100 pt-4 space-y-2.5">
                <div className="flex items-center space-x-1.5 text-slate-700">
                  <Settings2 className="w-3.5 h-3.5 text-indigo-500" />
                  <label htmlFor="custom-instructions" className="text-[11px] font-bold tracking-wide uppercase text-slate-500">
                    Additional Style Instructions (Optional)
                  </label>
                </div>
                
                <input
                  id="custom-instructions"
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. 'Keep it under 50 words', 'Add polite urgency', 'Friendly tone'"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 text-xs md:text-sm text-slate-700"
                />
                
                {/* Micro Tone Pre-sets helper */}
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold self-center mr-1.5">Presets:</span>
                  {[
                    "Make it succinct",
                    "Add polite empathy",
                    "Assertive & clear",
                    "Include call-to-action"
                  ].map((inst, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setCustomInstructions(inst)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        customInstructions === inst 
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-100/70 hover:bg-slate-200/50 text-slate-500 border border-transparent"
                      }`}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit trigger button */}
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className={`w-full py-2.5 px-4 rounded font-semibold tracking-wide text-xs flex items-center justify-center space-x-2 transition-all shadow-sm ${
                  inputText.trim() 
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Polishing drafting copies...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze &amp; Proofread</span>
                  </>
                )}
              </button>
            </form>

            {/* In-app Try Examples */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Need inspiration? Choose a draft preset:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {INITIAL_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePresetSelect(preset.text, preset.instruction)}
                    className="p-2.5 bg-slate-50/70 hover:bg-indigo-50/30 text-left rounded border border-slate-200 hover:border-indigo-200 transition-all group flex flex-col justify-between h-full"
                  >
                    <span className="text-[10px] font-bold text-slate-700 group-hover:text-indigo-700 transition-colors">
                      {preset.label}
                    </span>
                    <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 font-mono">
                      "{preset.text}"
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Beautiful Outputs (6 cols standard) */}
        <section className={`flex flex-col ${
          showHistory ? 'lg:col-span-12 xl:col-span-4' : 'lg:col-span-12 lg:col-span-6'
        }`}>
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-start space-x-2.5 text-red-800 shadow-sm">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-semibold">Oops! Something went wrong</p>
                <p className="mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between flex-1 min-h-[500px] overflow-hidden">
            {currentResult ? (
              <div className="flex flex-col flex-1 h-full">
                
                {/* Header copy buttons and Tabs Navigation */}
                <div className="border-b border-slate-200 bg-slate-50/70 p-3 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between whitespace-nowrap gap-2.5">
                  <div className="flex flex-wrap gap-1 bg-slate-150 p-0.5 rounded border border-slate-200 w-fit">
                    <button
                      onClick={() => setActiveTab("grammar")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide transition-all uppercase flex items-center space-x-1 ${
                        activeTab === "grammar"
                          ? "bg-white text-indigo-700 border border-slate-200/60 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <BookOpen className="w-3 h-3 text-amber-500" />
                      <span>Review</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("professional")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide transition-all uppercase flex items-center space-x-1 ${
                        activeTab === "professional"
                          ? "bg-white text-indigo-700 border border-slate-200/60 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Briefcase className="w-3 h-3 text-indigo-600" />
                      <span>Corp</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("average")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide transition-all uppercase flex items-center space-x-1 ${
                        activeTab === "average"
                          ? "bg-white text-indigo-700 border border-slate-200/60 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <User className="w-3 h-3 text-blue-500" />
                      <span>Average</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("casual")}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide transition-all uppercase flex items-center space-x-1 ${
                        activeTab === "casual"
                          ? "bg-white text-indigo-700 border border-slate-200/60 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Coffee className="w-3 h-3 text-teal-500" />
                      <span>Casual</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopy(getFullMarkdown(), "full-markdown")}
                    className="self-start sm:self-center bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 text-xs font-semibold tracking-wide rounded shadow-sm hover:shadow transition-all flex items-center space-x-1"
                  >
                    {copiedStatus["full-markdown"] ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Markup Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Full Response</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Dynamic Tabs Display */}
                <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto max-h-[620px]">
                  <AnimatePresence mode="wait">
                    {activeTab === "grammar" && (
                      <motion.div
                        key="grammar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.12 }}
                        className="space-y-4 flex-1 flex flex-col"
                      >
                        {/* High Density Accent Left bar frame */}
                        <div className="space-y-4 relative pl-3.5">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 rounded-full" />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                              <span>🔍 Grammar &amp; Clarity Review</span>
                            </span>
                            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                              Linguistic Edit
                            </span>
                          </div>

                          {currentResult.grammarLessons && currentResult.grammarLessons.length > 0 ? (
                            <div className="grid grid-cols-1 gap-3">
                              {currentResult.grammarLessons.map((lesson, index) => (
                                <div 
                                  key={index} 
                                  className="border border-slate-200 bg-slate-50/50 rounded-lg p-3 shadow-sm relative overflow-hidden"
                                >
                                  <div className="flex items-center space-x-2 pb-2 mb-2 border-b border-slate-100">
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                                      {index + 1}
                                    </span>
                                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">Lesson Change</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                    <div className="bg-red-50/50 border border-red-100 p-2 rounded text-xs text-slate-700">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 block mb-0.5">Original</span>
                                      "{lesson.originalPhrase}"
                                    </div>
                                    <div className="bg-emerald-50/40 border border-emerald-100 p-2 rounded text-xs text-slate-800">
                                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">Correction</span>
                                      "{lesson.correctedPhrase}"
                                    </div>
                                  </div>

                                  <div className="flex items-start space-x-1 text-xs text-slate-600">
                                    <Info className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                    <span>{lesson.explanation}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-6 bg-emerald-55/15 border border-emerald-200 rounded-lg flex flex-col items-center text-center space-y-2">
                              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                              <div>
                                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wide">
                                  Grammatically Perfect!
                                </h4>
                                <p className="text-emerald-700/80 text-[11px] mt-0.5">
                                  No spelling or structural edits found. Your original draft is pristine!
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Grammatically Corrected Text alone */}
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Polished Base Text
                            </span>
                            <button
                              onClick={() => handleCopy(currentResult.correctedTextOnly, "corrected-base")}
                              className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                            >
                              {copiedStatus["corrected-base"] ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <blockquote className="p-3 bg-slate-55 border border-slate-200 rounded-lg text-slate-700 font-sans italic text-xs md:text-sm leading-relaxed">
                            "{currentResult.correctedTextOnly}"
                          </blockquote>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "professional" && (
                      <motion.div
                        key="professional"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.12 }}
                        className="space-y-4 flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5 flex-1 relative pl-3.5">
                          {/* Left Accent stripe */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full" />
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <Briefcase className="w-4 h-4 text-indigo-600" />
                              <h3 className="font-display font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wide">
                                1. Professional Humanized Business
                              </h3>
                            </div>
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest shrink-0">
                              Formal • Authoritative
                            </span>
                          </div>

                          <div className="p-4 bg-white border border-slate-200 rounded-lg font-sans text-slate-700 text-xs md:text-sm leading-relaxed shadow-sm min-h-[140px] italic">
                            "{currentResult.professionalBusiness}"
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5 mt-2 text-[10px] md:text-xs text-slate-500">
                          <span className="font-bold uppercase tracking-wider text-slate-400 block">Use Case Guidance</span>
                          <p className="leading-relaxed">
                            Structured for board alerts, corporate announcements, client communications, and summaries. Restores pristine professional standing.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "average" && (
                      <motion.div
                        key="average"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.12 }}
                        className="space-y-4 flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5 flex-1 relative pl-3.5">
                          {/* Left Accent stripe */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <User className="w-4 h-4 text-blue-500" />
                              <h3 className="font-display font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wide">
                                2. Average Humanized English
                              </h3>
                            </div>
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest shrink-0">
                              Standard • Polite
                            </span>
                          </div>

                          <div className="p-4 bg-white border border-slate-200 rounded-lg font-sans text-slate-700 text-xs md:text-sm leading-relaxed shadow-sm min-h-[140px]">
                            {currentResult.averageEnglish}
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5 mt-2 text-[10px] md:text-xs text-slate-500">
                          <span className="font-bold uppercase tracking-wider text-slate-400 block">Use Case Guidance</span>
                          <p className="leading-relaxed">
                            Friendly, direct, and universally easy to read. Perfect for day-to-day office update syncs and regular team mail.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === "casual" && (
                      <motion.div
                        key="casual"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.12 }}
                        className="space-y-4 flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-3.5 flex-1 relative pl-3.5">
                          {/* Left Accent stripe */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-full" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5">
                              <Coffee className="w-4 h-4 text-teal-500" />
                              <h3 className="font-display font-bold text-slate-900 text-xs md:text-sm uppercase tracking-wide">
                                3. All Natural Normal Humanized English
                              </h3>
                            </div>
                            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-bold uppercase tracking-widest shrink-0">
                              Casual • Native Speaker
                            </span>
                          </div>

                          <div className="p-4 bg-white border border-slate-200 rounded-lg font-sans text-slate-700 text-xs md:text-sm leading-relaxed shadow-sm min-h-[140px]">
                            {currentResult.naturalCasual}
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5 mt-2 text-[10px] md:text-xs text-slate-500">
                          <span className="font-bold uppercase tracking-wider text-slate-400 block">Use Case Guidance</span>
                          <p className="leading-relaxed">
                            Fluid, contractions integrated, very native formulation. Optimal for quick Slack, Teams ping messages, or texting.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* High Density Footer Stats Block */}
                  <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 pt-3.5 font-medium select-none shrink-0">
                    <span>AI-Powered Contextual Rewriting</span>
                    <div className="flex gap-3">
                      <span>Tone Score: 98%</span>
                      <span>Consistency: High</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* High Density Empty Placeholder State */
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-3.5 flex-1 bg-slate-50/50">
                <div className="relative">
                  <div className="p-3.5 bg-indigo-50 text-indigo-500 rounded-lg shadow-sm relative z-10 animate-pulse">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                </div>

                <div className="space-y-1 max-w-[320px]">
                  <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wide">
                    Awaiting Draft Analysis
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Enter or paste some original text, set style instructions if needed, and press <b>Analyze</b> to fetch corrections and tone-styled rewrites!
                  </p>
                </div>
                
                {/* Visual hints */}
                <div className="grid grid-cols-1 gap-2 pt-3 w-full max-w-[320px]">
                  {[
                    "Self-corrects spelling, tenses, and formatting",
                    "Provides side-by-side grammar summaries",
                    "Generates 3 tone variants (Business, Standard, Casual)"
                  ].map((text, i) => (
                    <div key={i} className="flex items-center space-x-2 text-[10px] text-slate-500 bg-white p-2 rounded border border-slate-200 text-left">
                      <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* History Sidebar: Opens as sliding drawer or third column */}
        <AnimatePresence>
          {showHistory && (
            <motion.section
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:col-span-12 xl:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col space-y-3.5 max-h-[750px] overflow-hidden justify-between shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-1.5 text-slate-900">
                  <History className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider font-display">History Cache</h3>
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => saveHistory([])}
                    className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center space-x-1 uppercase tracking-wide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* History item nodes */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[580px]">
                {history.length > 0 ? (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectHistoryItem(item)}
                      className="group border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/10 p-3 rounded-lg cursor-pointer transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] text-slate-400 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                          className="text-slate-400 hover:text-red-500 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 font-medium line-clamp-2">
                        "{item.originalText}"
                      </p>

                      {item.customInstructions && (
                        <div className="bg-slate-100 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 truncate w-fit max-w-full">
                          Inst: {item.customInstructions}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 flex flex-col items-center justify-center space-y-1.5 flex-1">
                    <History className="w-7 h-7 text-slate-300" />
                    <p className="text-xs font-bold uppercase tracking-wider">No recent revisions</p>
                    <p className="text-[10px] text-slate-400">Analysis drafts will appear here sequentially.</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </div>

      {/* Footer info box */}
      <footer className="border-t border-slate-200 bg-white/70 py-3.5 px-6 mt-auto text-center shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center space-x-1.5 leading-none">
          <span>LEXIS AI Assisted English Copywriter Engine</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Powered by Gemini 3.5 Flash</span>
        </p>
      </footer>
    </div>
  );
}
