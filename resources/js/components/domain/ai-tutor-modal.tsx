import {
    Sparkles,
    Bot,
    Send,
    RotateCcw,
    BookOpen,
    Loader2,
    User as UserIcon,
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { TutorMessageContent } from '@/pages/user/tutor/components/tutor-message-content';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: string[];
    timestamp: Date;
}

const SUGGESTED_PROMPTS = [
    'What are the 8 norms of conduct under RA 6713?',
    'How do I solve work and rate word problems fast?',
    'What are common subject-verb agreement traps in CSE?',
    'Explain the doctrine of state immunity in the 1987 Constitution.',
];

export function AiTutorModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageCounter = useRef(0);

    const scrollToBottom = useCallback((instant = false) => {
        messagesEndRef.current?.scrollIntoView({ behavior: instant ? 'auto' : 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom(isLoading);
        }
    }, [isOpen, messages, isLoading, scrollToBottom]);

    const handleSend = async (questionText?: string) => {
        const text = (questionText || input).trim();

        if (!text || isLoading) {
            return;
        }

        messageCounter.current += 1;
        const userMsg: ChatMessage = {
            id: `user-${messageCounter.current}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s max timeout

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
                '';

            const history = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/ai-tutor/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ question: text, history }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Unable to get response from AI tutor. HTTP ${response.status}`);
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported by the browser.');
            }

            messageCounter.current += 1;
            const assistantMsgId = `ai-${messageCounter.current}`;

            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMsgId,
                    role: 'assistant',
                    content: '',
                    citations: [],
                    timestamp: new Date(),
                },
            ]);

            setIsLoading(false); // Can stop loading spinner once stream starts

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            const fullContent = '';
            const citations: string[] = [];

            let buffer = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;

                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const event of lines) {
                        if (event.startsWith('data: ')) {
                            const dataStr = event.substring(6);

                            if (dataStr === '[DONE]') {
                                done = true;
                                break;
                            }

                            try {
                                const data = JSON.parse(dataStr);

                                if (data.chunk) {
                                    const chunkText = data.chunk;
                                    setMessages((prev) =>
                                        prev.map((m) => {
                                            if (m.id === assistantMsgId) {
                                                const newContent = (m.content + chunkText).replace(/CITATIONS:\s*(.+)$/im, '');

                                                return { ...m, content: newContent };
                                            }

                                            return m;
                                        })
                                    );
                                }

                                if (data.citations) {
                                    const incomingCitations = data.citations;
                                    setMessages((prev) =>
                                        prev.map((m) =>
                                            m.id === assistantMsgId
                                                ? { ...m, citations: incomingCitations }
                                                : m
                                        )
                                    );
                                }
                            } catch {
                                // Ignore JSON parse errors for chunks
                            }
                        }
                    }
                }
            }
        } catch (err: unknown) {
            let errorMsg = 'An error occurred while asking the AI tutor.';

            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    errorMsg = 'Request timed out because it took too long to load. Please try again.';
                } else {
                    errorMsg = err.message;
                }
            }

            messageCounter.current += 1;
            const errorResponse: ChatMessage = {
                id: `err-${messageCounter.current}`,
                role: 'assistant',
                content: `**Unable to complete request:** ${errorMsg}\n\nPlease try again in a few moments.`,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            clearTimeout(timeoutId);
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([]);
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed right-5 bottom-6 z-40">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Hiraya AI Study Tutor"
                    className="group relative flex items-center gap-2.5 rounded-full border border-indigo-500/30 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-4 py-3 text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/40 active:scale-95 sm:px-5"
                >
                    <div className="flex size-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
                        <Sparkles className="size-4 animate-pulse text-amber-300" />
                    </div>
                    <span className="font-heading hidden text-sm font-bold tracking-wide sm:inline">
                        Ask AI Tutor
                    </span>
                    <span className="absolute -top-1 -right-1 flex size-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                        <span className="relative inline-flex size-3 rounded-full bg-purple-500" />
                    </span>
                </button>
            </div>

            {/* Dialog Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="flex h-[88vh] max-h-[720px] w-[95vw] max-w-2xl flex-col gap-0 p-0 sm:rounded-2xl">
                    {/* Header */}
                    <DialogHeader className="border-b border-border/60 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm dark:bg-indigo-500">
                                    <Bot className="size-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <DialogTitle className="font-heading text-base font-bold">
                                            Hiraya AI Tutor
                                        </DialogTitle>
                                        {/* <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                                            RAG Grounded
                                        </span> */}
                                    </div>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Verified Philippine Civil Service syllabus notes &amp; laws
                                    </DialogDescription>
                                </div>
                            </div>

                            {messages.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClear}
                                    className="mr-6 h-8 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="mr-1 size-3" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-950/40 dark:text-indigo-400">
                                    <BookOpen className="size-7" />
                                </div>
                                <h3 className="font-heading text-base font-bold text-foreground">
                                    What would you like to review today?
                                </h3>
                                <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
                                    Ask any concept from General Information, Clerical Ability,
                                    Verbal, Math, or Philippine Constitution.
                                </p>

                                <div className="mt-6 flex w-full max-w-2xl flex-col gap-2">
                                    <span className="text-left text-[11px] font-semibold text-muted-foreground uppercase">
                                        Suggested Review Topics:
                                    </span>
                                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSend(prompt)}
                                            className="rounded-xl border border-border/80 bg-muted/30 px-3.5 py-2 text-left text-xs font-medium text-foreground transition-all hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                                                <Bot className="size-4" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                                                    : 'border border-border/80 bg-card text-foreground shadow-xs'
                                                }`}
                                        >
                                            {msg.role === 'user' ? (
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    <TutorMessageContent content={msg.content} />

                                                    {msg.citations && msg.citations.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                                Syllabus Sources:
                                                            </span>
                                                            {msg.citations.map((cite, cIdx) => (
                                                                <span
                                                                    key={cIdx}
                                                                    className="rounded bg-muted px-1.5 py-0.5 font-medium"
                                                                >
                                                                    {cite}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                                <UserIcon className="size-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                                            <Bot className="size-4 animate-spin" />
                                        </div>
                                        <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card px-4 py-3 text-xs text-muted-foreground shadow-xs">
                                            <Loader2 className="size-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                                            {/* <span>Consulting syllabus notes &amp; legal rules...</span> */}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <div className="border-t border-border/60 bg-background p-3 sm:p-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex items-end gap-2"
                        >
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                placeholder="Ask a CSE syllabus question (e.g. RA 6713, word problems, grammar rules)..."
                                className="flex-1 resize-none rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden"
                            />
                            <Button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="size-10 shrink-0 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                            >
                                <Send className="size-4" />
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
