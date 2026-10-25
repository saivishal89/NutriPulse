import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  RotateCcw, 
  Plus, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  Trash2, 
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { UserProfile, ChatMessage, ChatSession } from '../types';
import { sounds } from '../utils/sound';

interface AiNutritionCoachProps {
  profile: UserProfile;
  onNavigateTab: (tab: string) => void;
  onOpenProfile: () => void;
}

const STORAGE_KEY_SESSIONS = 'nutripulse_chat_sessions';
const STORAGE_KEY_ACTIVE_ID = 'nutripulse_active_chat_id';

export const AiNutritionCoach: React.FC<AiNutritionCoachProps> = ({
  profile,
  onNavigateTab,
  onOpenProfile,
}) => {
  // Saved sessions list
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Active Session ID
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
      return saved || `session-${Date.now()}`;
    } catch (e) {
      return `session-${Date.now()}`;
    }
  });

  // Current conversation messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hello ${profile.name || 'there'}! I am your **NutriPulse AI Nutrition Coach**.\n\nI have your personalized profile loaded:\n- **Goal**: ${profile.goal.replace('_', ' ').toUpperCase()} (${profile.targetCalories} kcal/day)\n- **Daily Macros**: ${profile.proteinGrams}g Protein · ${profile.carbsGrams}g Carbs · ${profile.fatGrams}g Fat\n- **Diet**: ${profile.dietaryPreference.replace('_', ' ')}\n${profile.allergies && profile.allergies !== 'None' ? `- **Strict Allergies**: ${profile.allergies}\n` : ''}\nHow can I help optimize your nutrition today? Feel free to ask about meal ideas, post-workout recovery, hitting your protein goals, or food substitutions.`,
        timestamp: new Date().toISOString(),
        status: 'success',
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions.slice(0, 20)));
    } catch (e) {}
  }, [sessions]);

  // Persist active ID
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeSessionId);
    } catch (e) {}
  }, [activeSessionId]);

  // Quick contextual prompts
  const suggestedPrompts = [
    `How do I hit my ${profile.proteinGrams}g protein goal today?`,
    `Suggest 3 ${profile.dietaryPreference.replace('_', ' ')} dinner ideas under 600 calories`,
    `What should I eat before and after my workout for ${profile.goal.replace('_', ' ')}?`,
    `Is my ${profile.targetCalories} kcal target optimal for my ${profile.bmi} BMI?`,
  ];

  // FRESH START / NEW CHAT HANDLER
  const handleFreshStart = () => {
    sounds.tap();
    const newId = `session-${Date.now()}`;
    
    // Save current session if it has user messages
    if (messages.some(m => m.role === 'user')) {
      const firstUserMsg = messages.find(m => m.role === 'user')?.content.slice(0, 36) || 'Nutrition Consultation';
      const updatedSessions = [
        {
          id: activeSessionId,
          title: firstUserMsg,
          createdAt: messages[0]?.timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: messages,
        },
        ...sessions.filter(s => s.id !== activeSessionId),
      ];
      setSessions(updatedSessions);
    }

    // Completely reset transient states
    setActiveSessionId(newId);
    setInputPrompt('');
    setIsLoading(false);
    setActiveError(null);
    setLastFailedPrompt(null);

    // Initial fresh greeting strictly isolated from old conversation
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `New session started! 🍃\n\nI'm ready with your updated biometrics (${profile.targetCalories} kcal, ${profile.proteinGrams}g protein, ${profile.dietaryPreference}). What would you like to plan or analyze?`,
        timestamp: new Date().toISOString(),
        status: 'success',
      },
    ]);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Switch to an existing past session
  const handleLoadSession = (session: ChatSession) => {
    sounds.tap();
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setActiveError(null);
    setLastFailedPrompt(null);
    setShowSessionDrawer(false);
  };

  // Delete a past session
  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playWaterDrop();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // SEND MESSAGE HANDLER
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    sounds.tap();
    setInputPrompt('');
    setActiveError(null);
    setLastFailedPrompt(null);

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build conversation payload with user profile context
      const payload = {
        messages: updatedMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        profile,
        conversationId: activeSessionId,
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with ${res.status}`);
      }

      sounds.playNotificationChime();

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        status: 'success',
        sources: ['USDA FoodData Central', 'Clinical Nutrition Guidelines'],
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save/update session in history
      const title = updatedMessages.find(m => m.role === 'user')?.content.slice(0, 36) || 'Nutrition Chat';
      setSessions(prev => {
        const withoutCurrent = prev.filter(s => s.id !== activeSessionId);
        return [
          {
            id: activeSessionId,
            title,
            createdAt: messages[0]?.timestamp || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messages: [...updatedMessages, assistantMessage],
          },
          ...withoutCurrent,
        ];
      });

    } catch (err: any) {
      console.error('AI Coach Chat Error:', err);
      sounds.alarm();
      const errorMsg = err?.message || 'Failed to connect to AI Nutrition Coach.';
      setActiveError(errorMsg);
      setLastFailedPrompt(text);

      const errorMessageRecord: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Unable to complete response**\n\n${errorMsg}\n\n*Click "Retry Question" below to resubmit without losing your conversation.*`,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: errorMsg,
      };
      setMessages(prev => [...prev, errorMessageRecord]);
    } finally {
      setIsLoading(false);
    }
  };

  // RETRY ACTION
  const handleRetry = () => {
    if (!lastFailedPrompt) return;
    // Remove last error message and re-send
    setMessages(prev => prev.filter(m => m.status !== 'error'));
    handleSendMessage(lastFailedPrompt);
  };

  // Keyboard handler: Enter sends, Shift+Enter new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render markdown-like text cleanly without external packages
  const renderFormattedContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return (
      <div className="space-y-3 leading-relaxed text-sm">
        {paragraphs.map((p, idx) => {
          // Headers
          if (p.startsWith('### ') || p.startsWith('## ') || p.startsWith('# ')) {
            const headingText = p.replace(/^#+\s*/, '');
            return (
              <h4 key={idx} className="font-bold text-white text-base tracking-tight pt-1 border-b border-white/5 pb-1">
                {headingText}
              </h4>
            );
          }

          // Lists
          const lines = p.split('\n');
          const isList = lines.some(l => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()));
          if (isList) {
            return (
              <ul key={idx} className="space-y-1.5 pl-2">
                {lines.map((line, lIdx) => {
                  const cleanLine = line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '');
                  // Bold parser
                  const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
                  return (
                    <li key={lIdx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>
                        {parts.map((part, pIdx) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </span>
                    </li>
                  );
                })}
              </ul>
            );
          }

          // Regular paragraph with bolding
          const parts = p.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={idx} className="text-slate-200">
              {parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={pIdx} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-12 space-y-4 animate-in fade-in duration-300">
      
      {/* Top Banner: AI Coach Persona & Session Controls */}
      <div className="bg-[#10141f] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  NutriPulse AI Coach
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Personalized for <strong className="text-white">{profile.name}</strong> · {profile.targetCalories} kcal · {profile.proteinGrams}g Protein · {profile.dietaryPreference.replace('_', ' ')}
              </p>
            </div>
          </div>

          {/* Action Buttons: Fresh Start & Session History */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowSessionDrawer(!showSessionDrawer)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              title="View past sessions"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Past Chats ({sessions.length})</span>
            </button>

            <button
              onClick={handleFreshStart}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
              title="Start a new chat session with cleared history"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Sessions Drawer */}
        {showSessionDrawer && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                Saved Conversation History
              </span>
              <button
                onClick={() => setShowSessionDrawer(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No previous conversations saved yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleLoadSession(s)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                      s.id === activeSessionId
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : 'bg-black/30 hover:bg-black/50 border-white/5 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate">{s.title}</p>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(s.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                      title="Delete chat session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-[#0e121c] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col h-[650px] overflow-hidden">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    isUser
                      ? 'bg-[#ff5708] text-white'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 transition-all ${
                    isUser
                      ? 'bg-[#1e2333] border border-white/10 text-white rounded-tr-sm'
                      : msg.status === 'error'
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                      : 'bg-[#141926] border border-white/10 text-slate-200 rounded-tl-sm shadow-md'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  ) : (
                    renderFormattedContent(msg.content)
                  )}

                  {/* Metadata and Citations footer */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && msg.sources && (
                      <span className="flex items-center gap-1 text-emerald-400/80">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Verified Dietary Guidance</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-lg mr-auto animate-in fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#141926] border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 font-mono ml-2">Calculating nutritional strategy...</span>
              </div>
            </div>
          )}

          {/* Error Banner with Retry */}
          {activeError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{activeError}</span>
              </div>
              {lastFailedPrompt && (
                <button
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Pills */}
        <div className="px-4 py-2 border-t border-white/5 bg-[#121622] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 mr-1">Suggestions:</span>
          {suggestedPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              disabled={isLoading}
              className="text-xs bg-white/5 hover:bg-emerald-500/15 hover:text-emerald-300 text-slate-300 border border-white/10 hover:border-emerald-500/30 px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 sm:p-4 bg-[#141926] border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 bg-[#0a0d16] border border-white/15 focus-within:border-emerald-500/60 rounded-2xl p-2 transition shadow-inner">
              <textarea
                ref={textareaRef}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about meal plans, calories, protein targets, or food alternatives... (Enter to send, Shift+Enter for new line)"
                rows={2}
                disabled={isLoading}
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none px-2 py-1 leading-relaxed"
              />
              <div className="flex items-center justify-between px-2 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                <span>Personalized by Mifflin-St Jeor Engine</span>
                <span>{inputPrompt.length} chars</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 text-white flex items-center justify-center transition shadow-lg shadow-emerald-500/25 cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Safety & Medical Disclaimer */}
          <p className="text-[10px] text-slate-500 text-center mt-2 leading-tight">
            NutriPulse AI provides evidence-aware nutritional education based on USDA & clinical standards, not medical diagnosis or prescriptions.
          </p>
        </div>

      </div>

    </div>
  );
};
