import { router } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';
import { toast } from 'sonner';

export interface Citation {
    title: string;
    slug?: string;
    url?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    rawContent?: string;
    citations?: (string | Citation)[];
    timestamp: string;
    isError?: boolean;
}

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    activeQuestionId: string | null;
}

class TutorChatService {
    private state: ChatState = {
        messages: [],
        isLoading: false,
        activeQuestionId: null,
    };

    private listeners: Set<() => void> = new Set();
    private activeUserId: string | number | null = null;
    private currentAbortController: AbortController | null = null;
    private currentTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private initialized = false;

    private getStorageKey(userId: string | number): string {
        return `hiraya_tutor_chat_${userId}`;
    }

    public init(userId: string | number): void {
        if (this.activeUserId === userId && this.initialized) {
            return;
        }

        this.activeUserId = userId;
        this.initialized = true;

        if (typeof window === 'undefined') {
            return;
        }

        try {
            const saved = localStorage.getItem(this.getStorageKey(userId));
            const rawMessages: ChatMessage[] = saved ? JSON.parse(saved) : [];
            const messages = rawMessages.filter(
                (m) =>
                    m.role === 'user' ||
                    m.content.trim().length > 0 ||
                    m.isError,
            );
            const userMsgs = messages.filter((m) => m.role === 'user');
            const lastUserMsgId =
                userMsgs.length > 0 ? userMsgs[userMsgs.length - 1].id : null;

            // Preserve in-flight messages if generation is currently running
            if (!this.state.isLoading) {
                this.state = {
                    messages,
                    isLoading: false,
                    activeQuestionId: lastUserMsgId,
                };
            }
        } catch {
            if (!this.state.isLoading) {
                this.state = {
                    messages: [],
                    isLoading: false,
                    activeQuestionId: null,
                };
            }
        }

        this.notify();
    }

    public subscribe = (listener: () => void): (() => void) => {
        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };
    };

    public getSnapshot = (): ChatState => {
        return this.state;
    };

    private notify(): void {
        for (const listener of this.listeners) {
            listener();
        }
    }

    private persistMessages(): void {
        if (typeof window === 'undefined' || !this.activeUserId) {
            return;
        }

        try {
            const key = this.getStorageKey(this.activeUserId);
            const messagesToSave = this.state.messages.filter(
                (m) =>
                    m.role === 'user' ||
                    m.content.trim().length > 0 ||
                    m.isError,
            );

            if (messagesToSave.length > 0) {
                localStorage.setItem(key, JSON.stringify(messagesToSave));
            } else {
                localStorage.removeItem(key);
            }
        } catch {
            // Ignore storage quota limits
        }
    }

    public async sendMessage(text: string): Promise<void> {
        const trimmed = text.trim();

        if (!trimmed || this.state.isLoading) {
            return;
        }

        const now = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        const userMsgId = `user-${Date.now()}`;
        const userMsg: ChatMessage = {
            id: userMsgId,
            role: 'user',
            content: trimmed,
            timestamp: now,
        };

        const assistantMsgId = `ai-${Date.now() + 1}`;
        const assistantMsg: ChatMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            citations: [],
            timestamp: now,
        };

        const nextMessages = [...this.state.messages, userMsg, assistantMsg];
        this.state = {
            ...this.state,
            messages: nextMessages,
            isLoading: true,
            activeQuestionId: userMsgId,
        };
        this.persistMessages();
        this.notify();

        if (this.currentAbortController) {
            this.currentAbortController.abort();
        }

        const abortController = new AbortController();
        this.currentAbortController = abortController;

        if (this.currentTimeoutId) {
            clearTimeout(this.currentTimeoutId);
        }

        this.currentTimeoutId = setTimeout(() => {
            abortController.abort(
                new Error('The AI tutor took too long to respond.'),
            );
        }, 90000);

        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';

            const historyPayload = this.state.messages
                .filter((m) => m.id !== userMsgId && m.id !== assistantMsgId)
                .slice(-6)
                .map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

            const response = await fetch('/tutor/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'text/event-stream',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    question: trimmed,
                    history: historyPayload,
                }),
                signal: abortController.signal,
            });

            if (!response.ok) {
                throw new Error(
                    `Unable to get response from AI tutor. HTTP ${response.status}`,
                );
            }

            if (!response.body) {
                throw new Error('ReadableStream not supported by the browser.');
            }

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
                                    this.state = {
                                        ...this.state,
                                        messages: this.state.messages.map(
                                            (m) => {
                                                if (m.id === assistantMsgId) {
                                                    const raw = (m.rawContent ?? m.content) + chunkText;
                                                    const newContent = raw.replace(
                                                        /(?:\r?\n|\s*)CITATIONS:\s*[\s\S]*$/im,
                                                        '',
                                                    );

                                                    return {
                                                        ...m,
                                                        rawContent: raw,
                                                        content: newContent,
                                                    };
                                                }

                                                return m;
                                            },
                                        ),
                                    };
                                    this.notify();
                                }

                                if (data.citations) {
                                    const incomingCitations = data.citations;
                                    this.state = {
                                        ...this.state,
                                        messages: this.state.messages.map(
                                            (m) =>
                                                m.id === assistantMsgId
                                                    ? {
                                                          ...m,
                                                          citations:
                                                              incomingCitations,
                                                      }
                                                    : m,
                                        ),
                                    };
                                    this.notify();
                                }
                            } catch {
                                // Ignore chunk parse errors
                            }
                        }
                    }
                }
            }

            // Successfully completed stream
            this.state = {
                ...this.state,
                isLoading: false,
            };
            this.persistMessages();
            this.notify();

            // Background completion notification if the user navigated away from /tutor
            if (
                typeof window !== 'undefined' &&
                !window.location.pathname.startsWith('/tutor')
            ) {
                toast.success('Hiraya AI Tutor', {
                    description: 'Your explanation is ready to view.',
                    action: {
                        label: 'View',
                        onClick: () => router.visit('/tutor'),
                    },
                });
            }
        } catch (err: unknown) {
            let errorMsg =
                err instanceof Error
                    ? err.message
                    : 'An error occurred while communicating with the AI tutor.';

            if (err instanceof DOMException && err.name === 'AbortError') {
                errorMsg =
                    'The request timed out because it took too long to get a response.';
            }

            const isDev = import.meta.env.DEV;
            const displayError = isDev
                ? errorMsg
                : 'Our AI tutor is currently taking a short break or the server is busy.';

            const errorResponse: ChatMessage = {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: `**Unable to complete request:** ${displayError}\n\nPlease verify your connection and try again in a moment.`,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                isError: true,
            };

            // Replace empty assistant message or append error
            const cleaned = this.state.messages.filter(
                (m) => m.id !== assistantMsgId || m.content.trim().length > 0,
            );

            this.state = {
                ...this.state,
                messages: [...cleaned, errorResponse],
                isLoading: false,
            };
            this.persistMessages();
            this.notify();
        } finally {
            if (this.currentTimeoutId) {
                clearTimeout(this.currentTimeoutId);
                this.currentTimeoutId = null;
            }

            this.currentAbortController = null;
        }
    }

    public clearChat(): void {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
            this.currentAbortController = null;
        }

        if (this.currentTimeoutId) {
            clearTimeout(this.currentTimeoutId);
            this.currentTimeoutId = null;
        }

        this.state = {
            messages: [],
            isLoading: false,
            activeQuestionId: null,
        };
        this.persistMessages();
        this.notify();
    }

    public setActiveQuestionId(id: string | null): void {
        this.state = {
            ...this.state,
            activeQuestionId: id,
        };
        this.notify();
    }
}

export const tutorChatService = new TutorChatService();

export function useTutorChat(userId: string | number) {
    useEffect(() => {
        tutorChatService.init(userId);
    }, [userId]);

    return useSyncExternalStore(
        tutorChatService.subscribe,
        tutorChatService.getSnapshot,
        tutorChatService.getSnapshot,
    );
}

export function useIsTutorThinking() {
    return useSyncExternalStore(
        tutorChatService.subscribe,
        () => tutorChatService.getSnapshot().isLoading,
        () => false,
    );
}
