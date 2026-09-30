import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Sparkles,
  Bot,
  User,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import type { AcademicPaper, ChatMessage } from '../types/paper.ts';

interface PaperChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  papers: AcademicPaper[];
  activeTopic?: string;
}

const SUGGESTED_QUESTIONS = [
  'Which paper reports the strongest quantitative results or speedup?',
  'How do these approaches detect or monitor cache contention in hardware?',
  'What are the primary assumptions and limitations across these works?',
  'What benchmark suites (e.g. SPEC, PARSEC) were most commonly used?',
];

export const PaperChatDrawer: React.FC<PaperChatDrawerProps> = ({
  isOpen,
  onClose,
  papers,
  activeTopic,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `I can answer technical inquiries grounded directly in the ${papers.length} academic papers currently in your workspace. Ask about algorithms, benchmarks, tradeoffs, or hardware setups.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || input;
    if (!question.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers,
          question: question.trim(),
          topic: activeTopic,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to query assistant.');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Error: ${err.message || 'Could not communicate with assistant.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-neutral-850 bg-neutral-950 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-neutral-850 px-5 shrink-0 bg-neutral-950/90">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-neutral-400" />
          <h3 className="text-sm font-semibold text-neutral-100">
            Ask Assistant
          </h3>
          <span className="font-mono text-[10px] text-neutral-500 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
            {papers.length} papers
          </span>
        </div>

        <button
          onClick={onClose}
          className="rounded p-1 text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="border-b border-neutral-850 bg-neutral-900/30 p-3 space-y-1.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
          Suggested Technical Questions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 text-left text-[11px] text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col text-xs leading-relaxed ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="text-[10px] text-neutral-500 mb-1 px-1">
              {msg.role === 'user' ? 'You' : 'PaperPilot'} · {msg.timestamp}
            </div>

            <div
              className={`max-w-[90%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-neutral-800 text-neutral-100 border border-neutral-700/60'
                  : 'border border-neutral-850 bg-neutral-900/60 text-neutral-300'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-neutral-400 border-t-transparent" />
            <span>Consulting retrieved literature corpus...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className="border-t border-neutral-850 bg-neutral-950 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a technical question about the papers..."
            className="flex-1 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-950 hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
