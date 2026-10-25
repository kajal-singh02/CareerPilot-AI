import React, { useEffect, useState, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { ChatMessage, Conversation, Resume, Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { MarkdownMessage } from '../components/chat/MarkdownMessage';
import { ActionCard } from '../components/chat/ActionCard';
import {
  Send,
  Bot,
  Trash2,
  Edit2,
  Check,
  X,
  Plus,
  MessageSquare,
  FileText,
  Briefcase,
  Copy,
  RotateCcw,
  AlertCircle,
  Menu,
  Lightbulb
} from 'lucide-react';

const QUICK_ACTIONS = [
  'Analyze my resume.',
  'Find suitable jobs.',
  'Explain my skill gaps.',
  'Create my career roadmap.',
  'Practice a mock interview.',
  'Improve my resume.',
  'Suggest portfolio projects.',
  'Help me prepare for a technical interview.'
];

export const CareerChatbot: React.FC = () => {
  const { user } = useAuth();

  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');

  // Context selector state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | undefined>(undefined);
  const [selectedJobId, setSelectedJobId] = useState<number | undefined>(undefined);

  // Sidebar & modal UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load candidate's resumes & available jobs for the Context Selector
  useEffect(() => {
    const fetchContextData = async () => {
      try {
        const [resList, jobList] = await Promise.all([
          api.listResumes(),
          api.listJobs()
        ]);
        setResumes(resList);
        setJobs(jobList);
        if (resList.length > 0) {
          setSelectedResumeId(resList[0].id);
        }
      } catch (err) {
        console.warn('Could not load context selector data:', err);
      }
    };
    fetchContextData();
  }, []);

  const initWelcomeMessage = useCallback(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello ${user?.full_name?.split(' ')[0] || 'there'}! I am **CareerPilot Assistant**, your AI career strategist and engineering recruiter mentor powered by the Anthropic Claude engine.\n\nI have access to your database profile (${user?.profile?.preferred_role || 'Developer'}), uploaded resume, and job descriptions. Use the context selector above to focus on specific records, choose a quick action, or ask me anything!`
      }
    ]);
  }, [user]);

  const loadConversationMessages = useCallback(async (convId: number) => {
    setLoading(true);
    try {
      const fullConv = await api.getConversation(convId);
      setCurrentConvId(fullConv.id);
      setSelectedResumeId(fullConv.selected_resume_id);
      setSelectedJobId(fullConv.selected_job_id);
      setMessages(fullConv.messages.length > 0 ? fullConv.messages : []);
      if (fullConv.messages.length === 0) {
        initWelcomeMessage();
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setLoading(false);
    }
  }, [initWelcomeMessage]);

  // Load conversation history
  const loadConversations = useCallback(async () => {
    try {
      const convList = await api.listConversations();
      setConversations(convList);
      if (convList.length > 0 && !currentConvId) {
        // Select the most recent conversation
        setCurrentConvId(convList[0].id);
        loadConversationMessages(convList[0].id);
      } else if (convList.length === 0) {
        // Default greeting
        initWelcomeMessage();
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
      initWelcomeMessage();
    }
  }, [currentConvId, loadConversationMessages, initWelcomeMessage]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleStartNewConversation = async () => {
    try {
      const newConv = await api.createConversation({
        title: 'New Career Strategy Session',
        selected_resume_id: selectedResumeId,
        selected_job_id: selectedJobId
      });
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConvId(newConv.id);
      initWelcomeMessage();
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setErrorMsg(null);
    setLastUserPrompt(text);

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setLoading(true);

    try {
      const res = await api.sendChatMessage(
        text,
        currentConvId,
        selectedResumeId,
        selectedJobId
      );

      setCurrentConvId(res.conversation_id);
      setMessages((prev) => [
        ...prev,
        {
          id: res.message_id,
          role: 'assistant',
          content: res.content,
          metadata_json: res.metadata_json,
          created_at: res.created_at
        }
      ]);

      // Refresh conversations list to update title & timestamp
      const updatedList = await api.listConversations();
      setConversations(updatedList);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMsg(err.message || 'Unable to communicate with the CareerPilot AI assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleRename = async (convId: number) => {
    if (!editTitle.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      const updated = await api.updateConversation(convId, { title: editTitle.trim() });
      setConversations((prev) => prev.map((c) => (c.id === convId ? updated : c)));
      setEditingConvId(null);
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation thread?')) return;

    try {
      await api.deleteConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      if (currentConvId === convId) {
        if (remaining.length > 0) {
          setCurrentConvId(remaining[0].id);
          loadConversationMessages(remaining[0].id);
        } else {
          setCurrentConvId(undefined);
          initWelcomeMessage();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleClearCurrentChat = async () => {
    if (currentConvId) {
      try {
        await api.deleteConversation(currentConvId);
        setConversations((prev) => prev.filter((c) => c.id !== currentConvId));
      } catch {
        // ignore
      }
    }
    setCurrentConvId(undefined);
    initWelcomeMessage();
    setShowClearModal(false);
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-3 font-inter">
      {/* Top Header Bar & Context Selector */}
      <div className="bg-black/75 border border-white/10 backdrop-blur-xl rounded-2xl p-3 sm:px-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition"
            title="Toggle Conversations History"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#ef233c] text-white flex items-center justify-center shadow-lg shadow-[#ef233c]/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-manrope text-white leading-tight flex items-center space-x-2">
                <span>CareerPilot Assistant</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#ef233c]/15 border border-[#ef233c]/35 text-[10px] text-[#ef233c] font-semibold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef233c] animate-pulse"></span>
                  <span>Claude 3.5</span>
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-light">
                Authoritative AI career coaching grounded in your candidate database.
              </p>
            </div>
          </div>
        </div>

        {/* Personalized Context Selectors */}
        <div className="flex items-center space-x-2 flex-wrap text-xs">
          {/* Resume Context */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-[#ef233c] shrink-0" />
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">Resume:</span>
            <select
              value={selectedResumeId || ''}
              onChange={(e) => setSelectedResumeId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="" className="bg-zinc-900 text-white">Latest Upload</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id} className="bg-zinc-900 text-white">
                  {r.filename}
                </option>
              ))}
            </select>
          </div>

          {/* Target Job Context */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-zinc-300">
            <Briefcase className="w-3.5 h-3.5 text-[#ef233c] shrink-0" />
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">Target Vacancy:</span>
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-xs font-mono font-medium text-white focus:outline-none cursor-pointer max-w-[130px] truncate"
            >
              <option value="" className="bg-zinc-900 text-white">All Database Roles</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id} className="bg-zinc-900 text-white">
                  {j.title} ({j.company})
                </option>
              ))}
            </select>
          </div>

          {/* Clear Session Button */}
          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="p-2 rounded-xl border border-white/10 text-zinc-400 hover:text-[#ef233c] hover:bg-[#ef233c]/10 transition"
            title="Clear Chat Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + Chat Thread */}
      <div className="flex-1 flex overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl">
        {/* Sidebar: Conversation History */}
        {sidebarOpen && (
          <aside className="w-64 sm:w-72 border-r border-white/10 flex flex-col bg-zinc-950/90 shrink-0">
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
              <Button
                variant="primary"
                size="sm"
                className="w-full py-2 shadow-sm shadow-[#ef233c]/20"
                onClick={handleStartNewConversation}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>New Conversation</span>
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                Saved Conversations ({conversations.length})
              </div>

              {conversations.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500 font-light">
                  No saved conversations yet. Start chatting below!
                </div>
              ) : (
                conversations.map((c) => {
                  const isActive = c.id === currentConvId;
                  const isEditing = editingConvId === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => !isEditing && loadConversationMessages(c.id)}
                      className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                        isActive
                          ? 'bg-[#ef233c] text-white font-semibold shadow-md shadow-[#ef233c]/30'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate flex-1 mr-1">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(c.id)}
                            className="w-full text-xs bg-zinc-900 border border-zinc-700 text-white rounded px-1.5 py-0.5 focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate">{c.title}</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        {isEditing ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRename(c.id);
                              }}
                              className="p-1 hover:text-emerald-400"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingConvId(null);
                              }}
                              className="p-1 hover:text-zinc-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingConvId(c.id);
                                setEditTitle(c.title);
                              }}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Rename"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(c.id, e)}
                              className="p-1 text-zinc-400 hover:text-[#ef233c]"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* Chat Thread Container */}
        <main className="flex-1 flex flex-col overflow-hidden bg-black/40">
          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';

              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-[#ef233c] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#ef233c]/30 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble Card */}
                  <div
                    className={`group relative max-w-[88%] md:max-w-[78%] rounded-2xl p-4 transition-shadow ${
                      isUser
                        ? 'bg-gradient-to-br from-[#ef233c] to-[#990011] text-white font-medium rounded-tr-none shadow-lg shadow-[#ef233c]/20'
                        : 'bg-zinc-900/90 border border-white/10 text-zinc-100 rounded-tl-none shadow-xl hover:border-white/20'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line">{m.content}</p>
                    ) : (
                      <>
                        <MarkdownMessage content={m.content} />

                        {/* Interactive Consequential Tool Action Approval Card */}
                        {m.metadata_json?.action_required && (
                          <ActionCard
                            action={m.metadata_json.action_required}
                            onActionComplete={(result) => {
                              handleSend(`Action confirmed: ${result}`);
                            }}
                          />
                        )}

                        {/* Copy Message Action Button */}
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span className="text-[10px]">
                            {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Claude 3.5'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(m.content, idx)}
                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition"
                            title="Copy response"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/20 text-[#ef233c] flex items-center justify-center shrink-0 text-xs font-bold font-mono shadow-sm mt-0.5">
                      {user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'ME'}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#ef233c] text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-900 border border-white/10 p-3.5 rounded-2xl rounded-tl-none flex items-center space-x-2 text-xs text-zinc-300">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-[#ef233c] animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-[#ef233c] animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#ef233c] animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="font-medium text-zinc-400 pl-1 font-mono">Claude is evaluating candidate context & database records...</span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSend(lastUserPrompt)}
                  className="px-2.5 py-1 rounded bg-[#ef233c] hover:bg-[#d90429] text-white font-semibold text-xs flex items-center space-x-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestions Pills */}
          <div className="px-4 py-2 border-t border-white/10 flex items-center space-x-2 overflow-x-auto text-xs shrink-0 bg-black/60">
            <Lightbulb className="w-3.5 h-3.5 text-[#ef233c] shrink-0" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold shrink-0">Quick Actions:</span>
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(action)}
                className="px-2.5 py-1 rounded-full bg-zinc-900/90 hover:bg-[#ef233c]/20 hover:text-white hover:border-[#ef233c]/40 border border-white/10 text-zinc-300 whitespace-nowrap transition text-xs font-mono font-medium shadow-sm"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Text Input Area Footer */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-black/80 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-end space-x-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={input}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Claude about your resume, skill gaps, interview prep, or target jobs (Enter to send, Shift+Enter for new line)..."
                  className="w-full text-xs sm:text-[13px] border border-zinc-800 rounded-2xl pl-4 pr-10 py-3 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#ef233c] focus:border-transparent resize-none leading-relaxed transition max-h-[140px]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!input.trim() || loading}
                className="h-[44px] px-4 rounded-xl shadow-lg shadow-[#ef233c]/25 shrink-0"
              >
                <Send className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline font-semibold">Send</span>
              </Button>
            </form>

            <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 font-mono text-[10px] border border-zinc-700 text-zinc-300">Enter ↵</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 font-mono text-[10px] border border-zinc-700 text-zinc-300">Shift + Enter</kbd> for new line</span>
              <span className="text-[10px]">Strict factual grounding · Claude 3.5</span>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal for Clearing Chat Session */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center space-x-3 text-[#ef233c]">
              <div className="w-10 h-10 rounded-xl bg-[#ef233c]/15 border border-[#ef233c]/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-[#ef233c]" />
              </div>
              <div>
                <h3 className="font-manrope font-bold text-base text-white">Clear Conversation?</h3>
                <p className="text-xs text-zinc-400">This will remove the current chat thread.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Are you sure you want to delete this discussion? Past resume analyses and saved roadmap records will remain intact in your profile.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowClearModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleClearCurrentChat}>
                Delete & Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerChatbot;
