import { Head, usePage } from '@inertiajs/react';
import {
    Bot,
    Send,
    RotateCcw,
    BookOpen,
    Copy,
    Check,
    ExternalLink,
    ArrowUp,
    ListFilter,
    ChevronDown,
    FileText,
    Lightbulb,
    Zap,
    Target,
    Pin,
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TutorQuestionCheckpoint } from './components/tutor-checkpoints-rail';
import { TutorCheckpointsRail } from './components/tutor-checkpoints-rail';
import { TutorMessageContent } from './components/tutor-message-content';

interface ModuleItem {
    id?: number;
    title: string;
    slug: string;
    url: string;
}

interface Citation {
    title: string;
    slug?: string;
    url?: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: (string | Citation)[];
    timestamp: string;
    isError?: boolean;
}

interface SuggestedTopic {
    title: string;
    prompt: string;
    category: string;
}

interface TutorPageProps {
    modules?: ModuleItem[];
}

const SUGGESTED_TOPICS: SuggestedTopic[] = [
    {
        title: 'Work & Rate Problems',
        prompt: 'How do I solve work and rate word problems fast with shortcuts?',
        category: 'Numerical Ability',
    },
    {
        title: 'RA 6713 Ethical Standards',
        prompt: 'What are the 8 norms of conduct under RA 6713 with memory mnemonics?',
        category: 'General Information',
    },
    {
        title: 'Subject-Verb Agreement Traps',
        prompt: 'What are the most common subject-verb agreement traps in the Civil Service Exam?',
        category: 'Verbal Ability',
    },
    {
        title: '1987 Philippine Constitution',
        prompt: 'Explain the doctrine of state immunity and constitutional commissions under the 1987 Constitution.',
        category: 'Constitution & Laws',
    },
];

const FOLLOW_UP_SUGGESTIONS = [
    {
        label: 'Another Example',
        icon: <Lightbulb className="size-3.5" />,
        prompt: 'Can you provide another worked example step-by-step?',
    },
    {
        label: 'Common Traps',
        icon: <Zap className="size-3.5" />,
        prompt: 'What are the most common exam traps or mistakes on this topic?',
    },
    {
        label: 'Practice Drill',
        icon: <Target className="size-3.5" />,
        prompt: 'Give me 1 multiple-choice drill question with 4 options to test my understanding.',
    },
    {
        label: 'Key Rules & Mnemonics',
        icon: <Pin className="size-3.5" />,
        prompt: 'Summarize the core rules, formulas, and mnemonics for this topic.',
    },
];

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

function resolveCitation(
    cite: string | Citation,
    modules: ModuleItem[] = [],
): { title: string; url: string } {
    const rawTitle = typeof cite === 'string' ? cite : cite.title;
    const title = (rawTitle || '').trim();

    // 1. If citation object has explicit valid direct URL
    if (typeof cite === 'object' && cite !== null) {
        if (cite.url && cite.url !== '/learn' && cite.url !== '/learn/') {
            return { title, url: cite.url };
        }

        if (cite.slug) {
            return { title, url: `/learn/${cite.slug}` };
        }
    }

    // 2. Search against published learning modules
    const normalized = title.toLowerCase();
    const matched = modules.find((m) => {
        const mTitle = m.title.trim().toLowerCase();

        return (
            mTitle === normalized ||
            mTitle.includes(normalized) ||
            normalized.includes(mTitle)
        );
    });

    if (matched) {
        return {
            title,
            url: matched.url || `/learn/${matched.slug}`,
        };
    }

    // 3. Fallback to slugified module URL - NEVER fallback to general /learn
    return {
        title,
        url: `/learn/${slugify(title)}`,
    };
}

function getCitationsForMessage(
    msg: ChatMessage,
    allMessages: ChatMessage[],
    modules: ModuleItem[],
): (string | Citation)[] {
    if (msg.citations && msg.citations.length > 0) {
        return msg.citations;
    }

    if (modules.length === 0) {
        return [];
    }

    const msgIdx = allMessages.findIndex((m) => m.id === msg.id);
    const precedingUserMsg = msgIdx > 0 ? allMessages[msgIdx - 1] : null;
    const combined = `${precedingUserMsg?.content ?? ''} ${msg.content}`.toLowerCase();

    const matched = modules.find((m) => {
        const title = m.title.toLowerCase();
        const slug = m.slug.toLowerCase();

        if (combined.includes(slug) || combined.includes(title)) {
            return true;
        }

        if (
            (title.includes('agreement') || title.includes('grammar')) &&
            (combined.includes('agreement') || combined.includes('subject-verb') || combined.includes('grammar') || combined.includes('sva'))
        ) {
            return true;
        }

        if (
            (title.includes('6713') || title.includes('conduct')) &&
            (combined.includes('6713') || combined.includes('conduct') || combined.includes('ethical') || combined.includes('saln'))
        ) {
            return true;
        }

        if (
            title.includes('constitution') &&
            (combined.includes('constitution') || combined.includes('immunity') || combined.includes('commission'))
        ) {
            return true;
        }

        if (
            (title.includes('work') || title.includes('rate') || title.includes('problem')) &&
            (combined.includes('rate') || combined.includes('work') || combined.includes('cistern') || combined.includes('word problem'))
        ) {
            return true;
        }

        return false;
    });

    if (matched) {
        return [matched];
    }

    return [modules[0]];
}

export default function TutorPage({ modules: propModules = [] }: TutorPageProps) {
    const pageProps = usePage().props as {
        auth?: { user?: { id?: number } };
        modules?: ModuleItem[];
    };
    const modules = propModules.length > 0 ? propModules : (pageProps.modules ?? []);
    const userId = pageProps.auth?.user?.id ?? 'guest';
    const storageKey = `hiraya_tutor_chat_${userId}`;

    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }

        try {
            const saved = localStorage.getItem(storageKey);

            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
    const [activeQuestionId, setActiveQuestionId] = useState<string | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }

        try {
            const saved = localStorage.getItem(storageKey);

            if (saved) {
                const parsed: ChatMessage[] = JSON.parse(saved);
                const userMsgs = parsed.filter((m) => m.role === 'user');

                return userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].id : null;
            }
        } catch {
            return null;
        }

        return null;
    });

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messageCounter = useRef(0);

    // Sync message counter with loaded messages
    useEffect(() => {
        if (messages.length > messageCounter.current) {
            messageCounter.current = messages.length;
        }
    }, [messages]);

    // Persist messages across page reloads
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            if (messages.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(messages));
            } else {
                localStorage.removeItem(storageKey);
            }
        } catch {
            // Ignore storage quota limits
        }
    }, [messages, storageKey]);

    const scrollToTop = useCallback(() => {
        scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const scrollToBottom = useCallback((instant = false) => {
        const behavior = instant ? 'auto' : 'smooth';

        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior,
            });
        }
    }, []);

    const userQuestions = useMemo(() => {
        return messages.filter((m) => m.role === 'user');
    }, [messages]);

    const checkpointQuestions = useMemo<TutorQuestionCheckpoint[]>(() => {
        return userQuestions.map((q, idx) => ({
            id: q.id,
            index: idx + 1,
            questionText: q.content,
            timestamp: q.timestamp,
        }));
    }, [userQuestions]);

    const handleContainerScroll = useCallback(() => {
        const el = scrollContainerRef.current;

        if (!el) {
            return;
        }

        setShowScrollTop(el.scrollTop > 60);

        if (userQuestions.length > 0) {
            const containerRect = el.getBoundingClientRect();

            let currentActiveId = userQuestions[0].id;

            for (const q of userQuestions) {
                const msgEl = document.getElementById(`msg-${q.id}`);

                if (msgEl) {
                    const rect = msgEl.getBoundingClientRect();

                    if (rect.top <= containerRect.top + 220) {
                        currentActiveId = q.id;
                    }
                }
            }

            setActiveQuestionId(currentActiveId);
        }
    }, [userQuestions]);

    const jumpToMessage = useCallback((msgId: string) => {
        const element = document.getElementById(`msg-${msgId}`);
        const container = scrollContainerRef.current;

        if (element && container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const targetScrollTop =
                container.scrollTop + (elementRect.top - containerRect.top) - 20;

            container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
            setHighlightedMsgId(msgId);
            setActiveQuestionId(msgId);
            setTimeout(() => setHighlightedMsgId(null), 2500);
        } else if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setHighlightedMsgId(msgId);
            setActiveQuestionId(msgId);
            setTimeout(() => setHighlightedMsgId(null), 2500);
        }
    }, []);

    useEffect(() => {
        scrollToBottom(isLoading);
    }, [messages, isLoading, scrollToBottom]);

    const userQuestionMap = useMemo(() => {
        const map = new Map<string, number>();
        let count = 0;

        for (const msg of messages) {
            if (msg.role === 'user') {
                count += 1;
                map.set(msg.id, count);
            }
        }

        return map;
    }, [messages]);

    const handleSend = async (questionText?: string) => {
        const text = (questionText || input).trim();

        if (!text || isLoading) {
            return;
        }

        messageCounter.current += 1;
        const now = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const userMsg: ChatMessage = {
            id: `user-${messageCounter.current}`,
            role: 'user',
            content: text,
            timestamp: now,
        };

        setMessages((prev) => [...prev, userMsg]);
        setActiveQuestionId(userMsg.id);
        setInput('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        setIsLoading(true);

        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            abortController.abort(new Error("The AI tutor took too long to respond."));
        }, 90000);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ||
                '';

            const historyPayload = messages.slice(-6).map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/tutor/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    question: text,
                    history: historyPayload,
                }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error(`Unable to get response from AI tutor. HTTP ${response.status}`);
            }

            if (!response.body) {
                clearTimeout(timeoutId);

                throw new Error('ReadableStream not supported by the browser.');
            }

            clearTimeout(timeoutId);

            messageCounter.current += 1;
            const assistantMsgId = `ai-${messageCounter.current}`;
            const timestamp = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            });

            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMsgId,
                    role: 'assistant',
                    content: '',
                    citations: [],
                    timestamp: timestamp,
                },
            ]);

            setIsLoading(false); // Can stop loading spinner once stream starts

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

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
            let errorMsg =
                err instanceof Error
                    ? err.message
                    : 'An error occurred while communicating with the AI tutor.';
            
            if (err instanceof DOMException && err.name === 'AbortError') {
                errorMsg = 'The request timed out because it took too long to get a response.';
            }

            const isDev = import.meta.env.DEV;
            const displayError = isDev 
                ? errorMsg 
                : 'Our AI tutor is currently taking a short break or the server is busy.';

            messageCounter.current += 1;
            const errorResponse: ChatMessage = {
                id: `err-${messageCounter.current}`,
                role: 'assistant',
                content: `**Unable to complete request:** ${displayError}\n\nPlease verify your connection and try again in a moment.`,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isError: true,
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

    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    };

    const handleClear = () => {
        setMessages([]);
        setInput('');

        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(storageKey);
            } catch {
                // Ignore
            }
        }

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleCopy = async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            toast.success('Copied explanation to clipboard');
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const handleCopySessionNotes = async () => {
        if (messages.length === 0) {
            return;
        }

        try {
            const formatted = messages
                .map((m) => {
                    if (m.role === 'user') {
                        const num = userQuestionMap.get(m.id) ?? '';

                        return `### ❓ Question ${num ? `(${num})` : ''} - [${m.timestamp}]\n${m.content}`;
                    }

                    let ans = `### Hiraya AI Tutor Explanation - [${m.timestamp}]\n${m.content}`;

                    if (m.citations && m.citations.length > 0) {
                        const links = m.citations
                            .map((c) => {
                                const resolved = resolveCitation(c, modules);

                                return `- [${resolved.title}](${resolved.url})`;
                            })
                            .join('\n');
                        ans += `\n\n**Syllabus Sources:**\n${links}`;
                    }

                    return ans;
                })
                .join('\n\n---\n\n');

            const fullNotes = `# Hiraya AI Tutor - Study Session Notes\nSession Date: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n---\n\n${formatted}`;

            await navigator.clipboard.writeText(fullNotes);
            toast.success('Complete study session copied to clipboard!');
        } catch {
            toast.error('Failed to copy session notes');
        }
    };

    return (
        <>
            <Head title="AI Tutor - Philippine Civil Service Exam Mentor" />

            <div className="relative flex h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] w-full flex-1 flex-col overflow-hidden bg-background">
                {/* Header Bar */}
                <div className="shrink-0 border-b border-border/70 bg-card/60 px-4 py-3 backdrop-blur-md sm:px-6">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/20">
                                <Bot className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-heading text-base font-bold text-foreground sm:text-lg">
                                        Hiraya AI Tutor
                                    </h1>
                                    {/* <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                                        <Sparkles className="size-3 text-indigo-500" />
                                        RAG Grounded
                                    </span> */}
                                </div>
                                {/* <p className="line-clamp-1 text-xs text-muted-foreground">
                                    Philippine Civil Service Exam syllabus, RA 6713, and Constitution mentor
                                </p> */}
                            </div>
                        </div>

                        {messages.length > 0 && (
                            <div className="flex items-center gap-2">
                                {userQuestions.length >= 2 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5 rounded-lg border-border/80 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                            >
                                                <ListFilter className="size-3.5 text-indigo-500" />
                                                <span className="hidden md:inline">
                                                    Questions ({userQuestions.length})
                                                </span>
                                                <ChevronDown className="size-3 opacity-60" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-72 max-w-[90vw]"
                                        >
                                            <DropdownMenuLabel className="text-xs">
                                                Questions in this Session
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <div className="max-h-60 overflow-y-auto">
                                                {userQuestions.map((q, idx) => (
                                                    <DropdownMenuItem
                                                        key={q.id}
                                                        onClick={() => jumpToMessage(q.id)}
                                                        className="cursor-pointer gap-2 py-2 text-xs"
                                                    >
                                                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 font-mono text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                                            Q{idx + 1}
                                                        </span>
                                                        <span className="truncate">
                                                            {q.content}
                                                        </span>
                                                    </DropdownMenuItem>
                                                ))}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}


                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopySessionNotes}
                                    title="Copy entire study session notes to clipboard"
                                    className="h-8 gap-1.5 rounded-lg border-border/80 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <FileText className="size-3.5 text-indigo-500" />
                                    <span className="hidden sm:inline">Copy Notes</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    className="h-8 gap-1.5 rounded-lg border-border/80 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <RotateCcw className="size-3.5" />
                                    <span className="hidden sm:inline">Clear Chat</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Middle Split: Messages Stream + Side Checkpoints Rail */}
                <div className="relative flex flex-1 min-h-0 w-full overflow-hidden">
                    {/* Messages Body */}
                    <div
                        ref={scrollContainerRef}
                        onScroll={handleContainerScroll}
                        className="flex-1 min-w-0 overflow-y-auto px-4 py-6 sm:px-6"
                    >
                        <div className="mx-auto flex max-w-4xl flex-col gap-6">
                        {messages.length === 0 ? (
                            <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
                                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-inner dark:text-indigo-400">
                                    <BookOpen className="size-8" />
                                </div>
                                <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                                    Mabuhay! How can I assist your review?
                                </h2>
                                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                    Ask any concept from General Information, Clerical Ability,
                                    Verbal, Math, or Philippine Constitution. I provide step-by-step
                                    methods and exam shortcuts.
                                </p>

                                <div className="mt-8 w-full max-w-2xl text-left">
                                    <span className="mb-3 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Suggested Review Topics
                                    </span>
                                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                        {SUGGESTED_TOPICS.map((topic, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => handleSend(topic.prompt)}
                                                className="group flex flex-col items-start gap-1 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-indigo-50/40 hover:shadow-xs dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                                            >
                                                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                    {topic.category}
                                                </span>
                                                <span className="text-xs font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                    {topic.title}
                                                </span>
                                                <span className="line-clamp-2 text-[11px] text-muted-foreground">
                                                    &ldquo;{topic.prompt}&rdquo;
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((msg, index) => {
                                    const isHighlighted = highlightedMsgId === msg.id;
                                    const isLastAssistantMessage =
                                        msg.role === 'assistant' &&
                                        index === messages.length - 1 &&
                                        !isLoading;
                                    const questionNumber = userQuestionMap.get(msg.id);

                                    return (
                                        <div
                                            key={msg.id}
                                            id={`msg-${msg.id}`}
                                            className={`scroll-mt-6 flex gap-3 transition-all duration-300 sm:gap-4 ${msg.role === 'user'
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                                } ${isHighlighted ? 'rounded-2xl ring-3 ring-indigo-500 ring-offset-2 ring-offset-background shadow-lg shadow-indigo-500/20' : ''}`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 shadow-xs dark:bg-indigo-400/10 dark:text-indigo-400">
                                                    <Bot className="size-4.5" />
                                                </div>
                                            )}

                                            <div
                                                className={`relative max-w-2xl sm:max-w-3xl rounded-2xl p-4 sm:p-5 text-sm sm:text-[15px] leading-relaxed ${msg.role === 'user'
                                                        ? 'rounded-tr-xs bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                                                        : 'rounded-tl-xs border border-border/80 bg-card text-foreground shadow-xs'
                                                    }`}
                                            >
                                                {msg.role === 'user' ? (
                                                    <div>
                                                        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-semibold tracking-wider text-indigo-200">
                                                            <span>QUESTION {questionNumber}</span>
                                                            <span>{msg.timestamp}</span>
                                                        </div>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <TutorMessageContent content={msg.content} />

                                                        {(() => {
                                                            if (msg.isError) {
                                                                return null;
                                                            }

                                                            const messageCitations = getCitationsForMessage(msg, messages, modules);

                                                            if (messageCitations.length === 0) {
                                                                return null;
                                                            }

                                                            return (
                                                                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                                                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                                        Syllabus Sources:
                                                                    </span>
                                                                    {messageCitations.map((cite, cIdx) => {
                                                                        const resolved = resolveCitation(cite, modules);

                                                                        return (
                                                                            <a
                                                                                key={cIdx}
                                                                                href={resolved.url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="group inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2 py-0.5 font-medium text-foreground transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                                                                                title={`Open syllabus lesson: ${resolved.title}`}
                                                                            >
                                                                                <BookOpen className="size-2.5 text-indigo-500" />
                                                                                <span className="underline-offset-2 group-hover:underline">
                                                                                    {resolved.title}
                                                                                </span>
                                                                                <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                                                                            </a>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        })()}

                                                        {/* Follow-up Quick Drill Chips on the latest response */}
                                                        {isLastAssistantMessage && (
                                                            <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                                                                <span className="mb-2 block text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                                                    Continue Practice (1-Tap Follow Up)
                                                                </span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {FOLLOW_UP_SUGGESTIONS.map((item, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            type="button"
                                                                            onClick={() => handleSend(item.prompt)}
                                                                            className="group flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-card hover:text-indigo-600 hover:shadow-xs dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                                                                        >
                                                                            <span className="opacity-80">{item.icon}</span>
                                                                            <span>{item.label}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                                                            <span>{msg.timestamp}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(msg.id, msg.content)}
                                                                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-muted hover:text-foreground"
                                                            >
                                                                {copiedId === msg.id ? (
                                                                    <>
                                                                        <Check className="size-3 text-emerald-500" />
                                                                        <span className="text-emerald-500">Copied</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Copy className="size-3" />
                                                                        <span>Copy</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {msg.role === 'user' && (
                                                <div className="flex size-8 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-600/10 font-mono text-[10px] font-bold text-indigo-600 shadow-xs dark:bg-indigo-400/10 dark:text-indigo-400">
                                                    Q{questionNumber}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {isLoading && (
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 shadow-xs dark:bg-indigo-400/10 dark:text-indigo-400">
                                            <Bot className="size-4.5" />
                                        </div>
                                        <div className="rounded-2xl rounded-tl-xs border border-border/80 bg-card px-4 py-3.5 shadow-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5 py-1">
                                                    <span className="size-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
                                                    <span className="size-2 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.15s]" />
                                                    <span className="size-2 animate-bounce rounded-full bg-indigo-500" />
                                                </div>
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Consulting syllabus notes &amp; legal rules...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Side Checkpoints Rail */}
                    {checkpointQuestions.length > 0 && (
                        <TutorCheckpointsRail
                            questions={checkpointQuestions}
                            activeQuestionId={activeQuestionId}
                            highlightedMsgId={highlightedMsgId}
                            onSelectQuestion={jumpToMessage}
                            onScrollToTop={scrollToTop}
                            onScrollToBottom={() => scrollToBottom(false)}
                        />
                    )}
                </div>

            {/* Floating Scroll to Top */}
            {showScrollTop && (
                <div className="pointer-events-none fixed bottom-[5.5rem] right-8 z-50 animate-in fade-in duration-200">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-lg backdrop-blur-md transition-all hover:border-indigo-500/50 hover:bg-muted active:scale-95"
                        aria-label="Scroll to top of chat"
                        title="Scroll to top of chat"
                    >
                        <ArrowUp className="size-4 text-indigo-600 dark:text-indigo-400" />
                    </button>
                </div>
            )}

                {/* Footer Input Area */}
                <div className="shrink-0 border-t border-border/70 bg-card/60 p-4 pr-24 backdrop-blur-md sm:p-5 sm:pr-24 lg:pr-5">
                    <div className="mx-auto max-w-4xl">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="relative flex flex-col rounded-2xl border border-border/80 bg-background/90 shadow-sm transition-all focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20"
                        >
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleTextareaInput}
                                onKeyDown={handleKeyDown}
                                rows={2}
                                placeholder="Ask a CSE syllabus question (e.g. RA 6713 norms, work & rate shortcuts, grammar rules, constitution)..."
                                className="min-h-16 max-h-45 w-full resize-none bg-transparent px-4 py-3.5 text-xs sm:text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-hidden"
                            />

                            <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
                                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                                    Press <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd> to send, <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">Shift + Enter</kbd> for newline
                                </span>
                                <span className="text-[11px] text-muted-foreground sm:hidden">
                                    Tap send or Enter
                                </span>

                                <Button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    size="sm"
                                    className="h-8 gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    <Send className="size-3.5" />
                                    <span>Send</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

TutorPage.layout = {
    breadcrumbs: [
        {
            title: 'AI Tutor',
            href: '/tutor',
        },
    ],
};

