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
    Milestone,
} from 'lucide-react';
import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo,
} from 'react';
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
import { cn } from '@/lib/utils';
import type { TutorQuestionCheckpoint } from './components/tutor-checkpoints-rail';
import { TutorCheckpointsRail } from './components/tutor-checkpoints-rail';
import { TutorMessageContent } from './components/tutor-message-content';
import {
    tutorChatService,
    useTutorChat,
} from './services/tutor-chat-service';
import type { ChatMessage, Citation } from './services/tutor-chat-service';

interface ModuleItem {
    id?: number;
    title: string;
    slug: string;
    url: string;
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
        title: 'Subject-Verb Agreement Traps',
        prompt: 'What are the most common subject-verb agreement traps in the Civil Service Exam?',
        category: 'Verbal Ability',
    },
    {
        title: 'Logical Reasoning & Syllogisms',
        prompt: 'How do I solve syllogisms and logical deduction questions accurately in the exam?',
        category: 'Analytical Ability',
    },
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
    const combined =
        `${precedingUserMsg?.content ?? ''} ${msg.content}`.toLowerCase();

    const matched = modules.find((m) => {
        const title = m.title.toLowerCase();
        const slug = m.slug.toLowerCase();

        if (combined.includes(slug) || combined.includes(title)) {
            return true;
        }

        if (
            (title.includes('agreement') || title.includes('grammar')) &&
            (combined.includes('agreement') ||
                combined.includes('subject-verb') ||
                combined.includes('grammar') ||
                combined.includes('sva'))
        ) {
            return true;
        }

        if (
            (title.includes('6713') || title.includes('conduct')) &&
            (combined.includes('6713') ||
                combined.includes('conduct') ||
                combined.includes('ethical') ||
                combined.includes('saln'))
        ) {
            return true;
        }

        if (
            title.includes('constitution') &&
            (combined.includes('constitution') ||
                combined.includes('immunity') ||
                combined.includes('commission'))
        ) {
            return true;
        }

        if (
            (title.includes('work') ||
                title.includes('rate') ||
                title.includes('problem')) &&
            (combined.includes('rate') ||
                combined.includes('work') ||
                combined.includes('cistern') ||
                combined.includes('word problem'))
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

export default function TutorPage({
    modules: propModules = [],
}: TutorPageProps) {
    const pageProps = usePage().props as {
        auth?: { user?: { id?: number } };
        modules?: ModuleItem[];
    };
    const modules =
        propModules.length > 0 ? propModules : (pageProps.modules ?? []);
    const userId = pageProps.auth?.user?.id ?? 'guest';
    const {
        messages,
        isLoading,
        activeQuestionId: serviceActiveId,
    } = useTutorChat(userId);
    const [input, setInput] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(
        null,
    );
    const [isMobileCheckpointsOpen, setIsMobileCheckpointsOpen] =
        useState(false);
    const [userActiveQuestionId, setUserActiveQuestionId] = useState<
        string | null
    >(null);
    const activeQuestionId = userActiveQuestionId ?? serviceActiveId;
    const setActiveQuestionId = setUserActiveQuestionId;

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    const activeCheckpointIndex = useMemo(() => {
        const found = checkpointQuestions.find(
            (q) => q.id === (highlightedMsgId || activeQuestionId),
        );

        return found ? found.index : checkpointQuestions.length;
    }, [checkpointQuestions, activeQuestionId, highlightedMsgId]);

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
    }, [userQuestions, setActiveQuestionId]);

    const jumpToMessage = useCallback((msgId: string) => {
        const element = document.getElementById(`msg-${msgId}`);
        const container = scrollContainerRef.current;

        if (element && container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const targetScrollTop =
                container.scrollTop +
                (elementRect.top - containerRect.top) -
                20;

            container.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth',
            });
            setHighlightedMsgId(msgId);
            setActiveQuestionId(msgId);
            setTimeout(() => setHighlightedMsgId(null), 2500);
        } else if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setHighlightedMsgId(msgId);
            setActiveQuestionId(msgId);
            setTimeout(() => setHighlightedMsgId(null), 2500);
        }
    }, [setActiveQuestionId]);

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

        setInput('');

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        await tutorChatService.sendMessage(text);
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
        tutorChatService.clearChat();
        setInput('');

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
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/20 sm:size-10">
                                <Bot className="size-4 sm:size-5" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="truncate font-heading text-sm font-bold text-foreground sm:text-lg">
                                    Hiraya AI Tutor
                                </h1>
                            </div>
                        </div>

                        {messages.length > 0 && (
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                                {checkpointQuestions.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setIsMobileCheckpointsOpen(true)
                                        }
                                        className="h-8 gap-1 rounded-lg border-border/80 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
                                        aria-label={`Session checkpoints (${checkpointQuestions.length})`}
                                    >
                                        <Milestone className="size-3.5 shrink-0 text-indigo-500" />
                                        <span className="font-semibold text-foreground">
                                            Q{activeCheckpointIndex}/
                                            {checkpointQuestions.length}
                                        </span>
                                    </Button>
                                )}

                                {userQuestions.length >= 1 && (
                                    <div className="hidden md:block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-1.5 rounded-lg border-border/80 px-2.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    aria-label={`Questions list (${userQuestions.length})`}
                                                >
                                                    <ListFilter className="size-3.5 text-indigo-500" />
                                                    <span className="text-xs">
                                                        Questions (
                                                        {userQuestions.length})
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
                                                    {userQuestions.map(
                                                        (q, idx) => (
                                                            <DropdownMenuItem
                                                                key={q.id}
                                                                onClick={() =>
                                                                    jumpToMessage(
                                                                        q.id,
                                                                    )
                                                                }
                                                                className="cursor-pointer gap-2 py-2 text-xs"
                                                            >
                                                                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-indigo-50 font-mono text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                                                                    Q{idx + 1}
                                                                </span>
                                                                <span className="truncate">
                                                                    {q.content}
                                                                </span>
                                                            </DropdownMenuItem>
                                                        ),
                                                    )}
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCopySessionNotes}
                                    title="Copy entire study session notes to clipboard"
                                    className="h-8 gap-1.5 rounded-lg border-border/80 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground sm:px-2.5"
                                    aria-label="Copy session notes"
                                >
                                    <FileText className="size-3.5 shrink-0 text-indigo-500" />
                                    <span className="hidden sm:inline">
                                        Copy Notes
                                    </span>
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClear}
                                    className="h-8 gap-1.5 rounded-lg border-border/80 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground sm:px-2.5"
                                    title="Clear Chat"
                                    aria-label="Clear chat"
                                >
                                    <RotateCcw className="size-3.5 shrink-0" />
                                    <span className="hidden sm:inline">
                                        Clear Chat
                                    </span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Middle Split: Messages Stream + Side Checkpoints Rail */}
                <div className="relative flex min-h-0 w-full flex-1 overflow-hidden">
                    {/* Messages Column */}
                    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleContainerScroll}
                            className="min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6"
                        >
                            <div className="mx-auto flex max-w-4xl flex-col gap-6">
                                {messages.length === 0 ? (
                                    <div className="my-auto flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 shadow-inner dark:text-indigo-400">
                                            <BookOpen className="size-8" />
                                        </div>
                                        <h2 className="font-heading text-xl font-bold text-foreground sm:text-2xl">
                                            Mabuhay! How can I assist your
                                            review?
                                        </h2>
                                        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                                            Ask any concept from Verbal Ability,
                                            Analytical Ability, Numerical
                                            Ability, or General Information. I
                                            provide step-by-step methods and
                                            exam shortcuts.
                                        </p>

                                        <div className="mt-8 w-full max-w-2xl text-left">
                                            <span className="mb-3 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Suggested Review Topics
                                            </span>
                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                {SUGGESTED_TOPICS.map(
                                                    (topic, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSend(
                                                                    topic.prompt,
                                                                )
                                                            }
                                                            className="group flex flex-col items-start gap-1 rounded-xl border border-border/80 bg-card p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:bg-indigo-50/40 hover:shadow-xs dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
                                                        >
                                                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                                                {topic.category}
                                                            </span>
                                                            <span className="text-xs font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                                {topic.title}
                                                            </span>
                                                            <span className="line-clamp-2 text-[11px] text-muted-foreground">
                                                                &ldquo;
                                                                {topic.prompt}
                                                                &rdquo;
                                                            </span>
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {messages.map((msg, index) => {
                                            const isHighlighted =
                                                highlightedMsgId === msg.id;
                                            const isLastAssistantMessage =
                                                msg.role === 'assistant' &&
                                                index === messages.length - 1 &&
                                                !isLoading;
                                            const questionNumber =
                                                userQuestionMap.get(msg.id);

                                            return (
                                                <div
                                                    key={msg.id}
                                                    id={`msg-${msg.id}`}
                                                    className={`flex scroll-mt-6 gap-3 transition-all duration-300 sm:gap-4 ${
                                                        msg.role === 'user'
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    } ${isHighlighted ? 'rounded-2xl shadow-lg ring-3 shadow-indigo-500/20 ring-indigo-500 ring-offset-2 ring-offset-background' : ''}`}
                                                >
                                                    {msg.role ===
                                                        'assistant' && (
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 shadow-xs dark:bg-indigo-400/10 dark:text-indigo-400">
                                                            <Bot className="size-4.5" />
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`relative max-w-2xl rounded-2xl p-4 text-sm leading-relaxed sm:max-w-3xl sm:p-5 sm:text-[15px] ${
                                                            msg.role === 'user'
                                                                ? 'rounded-tr-xs bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                                                                : 'rounded-tl-xs border border-border/80 bg-card text-foreground shadow-xs'
                                                        }`}
                                                    >
                                                        {msg.role === 'user' ? (
                                                            <div>
                                                                <div className="mb-1 flex items-center justify-between gap-3 text-[10px] font-semibold tracking-wider text-indigo-200">
                                                                    <span>
                                                                        QUESTION{' '}
                                                                        {
                                                                            questionNumber
                                                                        }
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            msg.timestamp
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="whitespace-pre-wrap">
                                                                    {
                                                                        msg.content
                                                                    }
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                <TutorMessageContent
                                                                    content={
                                                                        msg.content
                                                                    }
                                                                />

                                                                {(() => {
                                                                    if (
                                                                        msg.isError
                                                                    ) {
                                                                        return null;
                                                                    }

                                                                    const messageCitations =
                                                                        getCitationsForMessage(
                                                                            msg,
                                                                            messages,
                                                                            modules,
                                                                        );

                                                                    if (
                                                                        messageCitations.length ===
                                                                        0
                                                                    ) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5 text-[11px] text-muted-foreground">
                                                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                                                Syllabus
                                                                                Sources:
                                                                            </span>
                                                                            {messageCitations.map(
                                                                                (
                                                                                    cite,
                                                                                    cIdx,
                                                                                ) => {
                                                                                    const resolved =
                                                                                        resolveCitation(
                                                                                            cite,
                                                                                            modules,
                                                                                        );

                                                                                    return (
                                                                                        <a
                                                                                            key={
                                                                                                cIdx
                                                                                            }
                                                                                            href={
                                                                                                resolved.url
                                                                                            }
                                                                                            target="_blank"
                                                                                            rel="noopener noreferrer"
                                                                                            className="group inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2 py-0.5 font-medium text-foreground transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                                                                                            title={`Open syllabus lesson: ${resolved.title}`}
                                                                                        >
                                                                                            <BookOpen className="size-2.5 text-indigo-500" />
                                                                                            <span className="underline-offset-2 group-hover:underline">
                                                                                                {
                                                                                                    resolved.title
                                                                                                }
                                                                                            </span>
                                                                                            <ExternalLink className="size-2.5 opacity-60 group-hover:opacity-100" />
                                                                                        </a>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}

                                                                {/* Follow-up Quick Drill Chips on the latest response */}
                                                                {isLastAssistantMessage && (
                                                                    <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                                                                        <span className="mb-2 block text-[10px] font-bold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                                                                            Continue
                                                                            Practice
                                                                            (1-Tap
                                                                            Follow
                                                                            Up)
                                                                        </span>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {FOLLOW_UP_SUGGESTIONS.map(
                                                                                (
                                                                                    item,
                                                                                    idx,
                                                                                ) => (
                                                                                    <button
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleSend(
                                                                                                item.prompt,
                                                                                            )
                                                                                        }
                                                                                        className="group flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-card hover:text-indigo-600 hover:shadow-xs dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                                                                                    >
                                                                                        <span className="opacity-80">
                                                                                            {
                                                                                                item.icon
                                                                                            }
                                                                                        </span>
                                                                                        <span>
                                                                                            {
                                                                                                item.label
                                                                                            }
                                                                                        </span>
                                                                                    </button>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                                                                    <span>
                                                                        {
                                                                            msg.timestamp
                                                                        }
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleCopy(
                                                                                msg.id,
                                                                                msg.content,
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-muted hover:text-foreground"
                                                                    >
                                                                        {copiedId ===
                                                                        msg.id ? (
                                                                            <>
                                                                                <Check className="size-3 text-emerald-500" />
                                                                                <span className="text-emerald-500">
                                                                                    Copied
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Copy className="size-3" />
                                                                                <span>
                                                                                    Copy
                                                                                </span>
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
                                                            Consulting syllabus
                                                            notes &amp; legal
                                                            rules...
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

                        {/* Floating Scroll to Top - anchored within messages column, hidden on desktop when rail has controls */}
                        {showScrollTop && (
                            <div
                                className={cn(
                                    'pointer-events-none absolute right-3 bottom-3 z-30 animate-in duration-200 fade-in sm:right-6 sm:bottom-4',
                                    checkpointQuestions.length > 0 &&
                                        'lg:hidden',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={scrollToTop}
                                    className="pointer-events-auto flex size-9 items-center justify-center rounded-full border border-border/80 bg-background/95 text-foreground shadow-md backdrop-blur-md transition-all hover:border-indigo-500/50 hover:bg-muted active:scale-95 sm:size-10"
                                    aria-label="Scroll to top of chat"
                                    title="Scroll to top of chat"
                                >
                                    <ArrowUp className="size-4 text-indigo-600 dark:text-indigo-400" />
                                </button>
                            </div>
                        )}
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
                            isMobileSheetOpen={isMobileCheckpointsOpen}
                            onMobileSheetOpenChange={setIsMobileCheckpointsOpen}
                        />
                    )}
                </div>

                {/* Footer Input Area */}
                <div className="shrink-0 border-t border-border/70 bg-card/60 p-3 backdrop-blur-md sm:p-5">
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
                                placeholder="Ask a CSE syllabus question (e.g. grammar rules, logic syllogisms, work & rate shortcuts, RA 6713)..."
                                className="max-h-45 min-h-16 w-full resize-none bg-transparent px-4 py-3.5 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-hidden sm:text-sm"
                            />

                            <div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
                                <span className="hidden text-[11px] text-muted-foreground sm:inline">
                                    Press{' '}
                                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                        Enter
                                    </kbd>{' '}
                                    to send,{' '}
                                    <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                                        Shift + Enter
                                    </kbd>{' '}
                                    for newline
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
