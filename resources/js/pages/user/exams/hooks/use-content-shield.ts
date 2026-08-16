import type React from 'react';
import { useEffect, useRef, useCallback, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Production-grade content protection hook.
 *
 * KEY DESIGN: Uses SYNCHRONOUS direct DOM manipulation to blur content
 * BEFORE the browser compositor paints the next frame. This ensures that
 * screenshot tools (Snipping Tool, PrtSc) capture a blurred/blank frame
 * because the CSS filter + opacity change happens in the same event task
 * as the blur/visibilitychange handler — before the screenshot is composited.
 *
 * React state is updated synchronously via flushSync to show the overlay
 * immediately.
 *
 * Protection layers:
 *  1. Instant DOM blur on window.blur / visibilitychange (no debounce)
 *  2. CSS user-select: none + selectionchange clearing
 *  3. Clipboard API override + copy/cut event interception
 *  4. Context menu blocking
 *  5. Print blocking (@media print + beforeprint)
 *  6. Drag prevention
 *  7. DevTools shortcut blocking
 *  8. Screenshot shortcut interception (PrintScreen, Win+Shift+S/T)
 *  9. Screen capture API (getDisplayMedia) override
 * 10. Clipboard wiping after shield activation
 */

interface UseContentShieldOptions {
    onCopyAttempt?: (msg: string) => void;
    onShieldActivate?: () => void;
    contentLabel?: 'Exam' | 'Review' | 'Drill' | 'Custom Drill' | string;
}

interface UseContentShieldReturn {
    isShielded: boolean;
    /** True while the shield is "locked" — window is not genuinely focused/visible,
     *  so content must stay sealed regardless of click attempts. */
    isResumeLocked: boolean;
    dismissShield: () => void;
    styleBlock: string;
    /** Ref to attach to the main content wrapper div for instant DOM blur */
    contentRef: React.RefObject<HTMLDivElement | null>;
    wrapperProps: {
        onCopy: (e: React.ClipboardEvent) => void;
        onContextMenu: (e: React.MouseEvent) => void;
        onMouseDown: (e: React.MouseEvent) => void;
        onDragStart: (e: React.DragEvent) => void;
    };
}

const SHIELD_STYLE = `
    *, *::before, *::after {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
    }
    input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
    }
    @media print {
        body * { display: none !important; }
        body::after {
            content: "Printing is disabled for protected content.";
            display: block;
            text-align: center;
            padding: 40px;
            font-size: 24px;
            color: #666;
        }
    }
`;

function isInputElement(el: EventTarget | null): boolean {
    if (!el) {
        return false;
    }

    const tag = (el as HTMLElement)?.tagName;

    return ['INPUT', 'TEXTAREA'].includes(tag);
}

function isInteractiveElement(el: EventTarget | null): boolean {
    if (!el) {
        return false;
    }

    const target = el as HTMLElement;
    const tag = target?.tagName;

    return (
        ['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'SELECT'].includes(tag) ||
        !!target?.closest('button, a, input, textarea, select, [role="button"]')
    );
}

export function useContentShield(
    options: UseContentShieldOptions = {},
): UseContentShieldReturn {
    const { onCopyAttempt, onShieldActivate, contentLabel = 'Exam' } = options;

    // Keep latest callbacks in refs so listener effects never re-run on every
    // parent render (the exam view re-renders every second for the timer).
    const onCopyAttemptRef = useRef(onCopyAttempt);
    const onShieldActivateRef = useRef(onShieldActivate);
    const contentLabelRef = useRef(contentLabel);

    useEffect(() => {
        onCopyAttemptRef.current = onCopyAttempt;
        onShieldActivateRef.current = onShieldActivate;
        contentLabelRef.current = contentLabel;
    });

    const [isShielded, setIsShielded] = useState(false);
    const [isResumeLocked, setIsResumeLocked] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const origWriteTextRef = useRef<((text: string) => Promise<void>) | null>(
        null,
    );
    const origGetDisplayMediaRef = useRef<
        | ((constraints?: DisplayMediaStreamOptions) => Promise<MediaStream>)
        | null
    >(null);

    // Cooldown lock: after a shield activation the user must wait before the Resume button unlocks
    const lockUntilRef = useRef(0);

    // ── INSTANT DOM blur — runs synchronously, bypasses React render cycle ──
    const instantBlurContent = useCallback(() => {
        const el = contentRef.current;

        if (el) {
            el.style.filter = 'blur(40px) brightness(1.8)';
            el.style.opacity = '0';
            el.style.transition = 'none';
        }
    }, []);

    const clearInstantBlur = useCallback(() => {
        const el = contentRef.current;

        if (el) {
            el.style.filter = '';
            el.style.opacity = '';
            el.style.transition = '';
        }
    }, []);

    // Wipe clipboard contents after shield activates
    const wipeClipboard = useCallback(() => {
        try {
            if (origWriteTextRef.current) {
                origWriteTextRef.current
                    .call(navigator.clipboard, '')
                    .catch(() => {});
            } else if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText('').catch(() => {});
            }
        } catch {
            // Clipboard API may not be available in all contexts
        }
    }, []);

    const activateShield = useCallback(() => {
        // 1. Instant DOM manipulation (synchronous — before next paint)
        instantBlurContent();
        // 2. Wipe clipboard so any copied screenshot data is cleared
        wipeClipboard();

        // 3. Update React state synchronously (shows overlay in same frame)
        try {
            flushSync(() => {
                setIsShielded(true);
            });
        } catch {
            setIsShielded(true);
        }

        // 4. Cooldown lock
        const now = Date.now();
        lockUntilRef.current = Math.max(lockUntilRef.current, now + 1500);
        const lockStillActive = now < lockUntilRef.current;
        setIsResumeLocked(
            lockStillActive || !document.hasFocus() || document.hidden,
        );

        onShieldActivateRef.current?.();
    }, [instantBlurContent, wipeClipboard]);

    const dismissShield = useCallback(() => {
        // Refuse to uncover content during the cooldown lock or if window is not focused
        if (
            Date.now() < lockUntilRef.current ||
            !document.hasFocus() ||
            document.hidden
        ) {
            setIsResumeLocked(true);
            instantBlurContent();
            setIsShielded(true);

            return;
        }

        setIsResumeLocked(false);
        clearInstantBlur();
        setIsShielded(false);
    }, [clearInstantBlur, instantBlurContent]);

    // ── Core event listeners ────────────────────────────────────
    useEffect(() => {
        // 1. Visibility API (tab switch, minimize, snipping tool)
        const handleVisibility = () => {
            if (document.hidden) {
                instantBlurContent();
                activateShield();
            }
        };

        // 2. Window blur — Instant blur immediately, activate shield synchronously
        const handleBlur = () => {
            instantBlurContent();
            activateShield();
        };

        // 3. Focus return
        const handleFocus = () => {
            const now = Date.now();
            setIsResumeLocked(
                now < lockUntilRef.current ||
                    document.hidden ||
                    !document.hasFocus(),
            );
        };

        // 4. Selection prevention
        const handleSelectStart = (e: Event) => {
            if (!isInputElement(e.target)) {
                e.preventDefault();
            }
        };

        const handleSelectionChange = () => {
            const selection = window.getSelection();

            if (selection && selection.rangeCount > 0) {
                const tag = selection.anchorNode?.parentElement?.tagName;

                if (!['INPUT', 'TEXTAREA'].includes(tag || '')) {
                    selection.removeAllRanges();
                }
            }
        };

        // 5. Clipboard interception
        const handleCopy = (e: ClipboardEvent) => {
            if (!isInputElement(e.target)) {
                e.preventDefault();
                e.stopPropagation();

                if (e.clipboardData) {
                    e.clipboardData.setData('text/plain', '');
                }

                onCopyAttemptRef.current?.(
                    `Copying content is disabled during ${contentLabelRef.current.toLowerCase()}s.`,
                );
            }
        };

        // 6. Context menu
        const handleContextMenu = (e: MouseEvent) => {
            if (!isInputElement(e.target)) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // 7. Print blocking
        const handleBeforePrint = () => {
            instantBlurContent();
            activateShield();
        };

        // ── API overrides ────────────────────────────────────────
        if (navigator.clipboard?.writeText) {
            origWriteTextRef.current = navigator.clipboard.writeText.bind(
                navigator.clipboard,
            );
            navigator.clipboard.writeText = async () => {
                onCopyAttemptRef.current?.(
                    `Copying content is disabled during ${contentLabelRef.current.toLowerCase()}s.`,
                );

                return Promise.reject(new Error('Copying disabled'));
            };
        }

        const origClipboardWrite = navigator.clipboard?.write?.bind(
            navigator.clipboard,
        );

        if (navigator.clipboard?.write) {
            navigator.clipboard.write = async () => {
                return Promise.reject(new Error('Clipboard write disabled'));
            };
        }

        if (navigator.mediaDevices?.getDisplayMedia) {
            origGetDisplayMediaRef.current =
                navigator.mediaDevices.getDisplayMedia.bind(
                    navigator.mediaDevices,
                );
            navigator.mediaDevices.getDisplayMedia = async () => {
                instantBlurContent();
                activateShield();

                return Promise.reject(
                    new Error(
                        'Screen capture is not permitted during examinations.',
                    ),
                );
            };
        }

        // ── Register listeners ───────────────────────────────────
        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('selectstart', handleSelectStart, {
            capture: true,
        });
        window.addEventListener('copy', handleCopy, { capture: true });
        window.addEventListener('cut', handleCopy, { capture: true });
        window.addEventListener('contextmenu', handleContextMenu, {
            capture: true,
        });
        document.addEventListener('selectionchange', handleSelectionChange);
        window.addEventListener('beforeprint', handleBeforePrint);

        // ── Shield watchdog ───────────────────────────────────────
        const watchdogId = window.setInterval(() => {
            const compromised = document.hidden || !document.hasFocus();

            if (!compromised) {
                setIsResumeLocked(Date.now() < lockUntilRef.current);

                return;
            }

            instantBlurContent();
            setIsResumeLocked(true);

            try {
                flushSync(() => {
                    setIsShielded(true);
                });
            } catch {
                setIsShielded(true);
            }
        }, 250);

        return () => {
            window.clearInterval(watchdogId);

            if (origWriteTextRef.current && navigator.clipboard) {
                navigator.clipboard.writeText = origWriteTextRef.current;
                origWriteTextRef.current = null;
            }

            if (origClipboardWrite && navigator.clipboard) {
                navigator.clipboard.write = origClipboardWrite;
            }

            if (origGetDisplayMediaRef.current && navigator.mediaDevices) {
                navigator.mediaDevices.getDisplayMedia =
                    origGetDisplayMediaRef.current;
                origGetDisplayMediaRef.current = null;
            }

            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('selectstart', handleSelectStart, {
                capture: true,
            });
            window.removeEventListener('copy', handleCopy, { capture: true });
            window.removeEventListener('cut', handleCopy, { capture: true });
            window.removeEventListener('contextmenu', handleContextMenu, {
                capture: true,
            });
            document.removeEventListener(
                'selectionchange',
                handleSelectionChange,
            );
            window.removeEventListener('beforeprint', handleBeforePrint);
        };
    }, [activateShield, instantBlurContent]);

    // ── Keyboard security ────────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isInput =
                isInputElement(e.target) ||
                (e.target as HTMLElement)?.isContentEditable;

            // Check PrintScreen (PrtScn) key across all browser/OS variants
            const isPrintScreen =
                e.key === 'PrintScreen' ||
                e.code === 'PrintScreen' ||
                e.key === 'Snapshot' ||
                e.code === 'Snapshot' ||
                e.key === 'Print' ||
                e.keyCode === 44 ||
                e.which === 44;

            if (isPrintScreen) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                instantBlurContent();
                wipeClipboard();
                activateShield();
                onCopyAttemptRef.current?.('Screenshot capture is blocked. Practice content is protected.');

                return;
            }

            // Seal on Win/Meta key press
            if (
                e.key === 'Meta' ||
                e.code === 'MetaLeft' ||
                e.code === 'MetaRight'
            ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                instantBlurContent();
                activateShield();

                return;
            }

            // Block Win+Shift+T (PowerToys Text Extractor / OCR)
            if (
                (e.metaKey && e.shiftKey && e.code === 'KeyT') ||
                (!isInput && e.shiftKey && e.code === 'KeyT')
            ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                instantBlurContent();
                activateShield();

                return;
            }

            // Block Win+Shift+S (Snipping tool), Xbox Game Bar record (Win+Alt+R), macOS Cmd+Shift+3/4/5
            if (
                (e.metaKey && e.shiftKey && e.code === 'KeyS') ||
                (e.metaKey && e.altKey && e.code === 'KeyR') ||
                (!isInput && e.shiftKey && e.code === 'KeyS') ||
                (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))
            ) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                instantBlurContent();
                activateShield();

                return;
            }

            // Block F12, DevTools, Copy/Print/Save/Select-All/View-Source
            if (
                e.key === 'F12' ||
                (e.ctrlKey &&
                    e.shiftKey &&
                    ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) ||
                (e.metaKey &&
                    e.altKey &&
                    ['I', 'i', 'J', 'j', 'C', 'c', 'U', 'u'].includes(e.key)) ||
                ((e.ctrlKey || e.metaKey) &&
                    ['u', 'U', 's', 'S', 'p', 'P', 'a', 'A'].includes(e.key))
            ) {
                if (!isInput) {
                    e.preventDefault();
                    e.stopPropagation();

                    return;
                }
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const isPrintScreen =
                e.key === 'PrintScreen' ||
                e.code === 'PrintScreen' ||
                e.key === 'Snapshot' ||
                e.code === 'Snapshot' ||
                e.key === 'Print' ||
                e.keyCode === 44 ||
                e.which === 44;

            if (isPrintScreen) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation?.();
                instantBlurContent();
                wipeClipboard();
                activateShield();
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        document.addEventListener('keydown', handleKeyDown, { capture: true });
        document.addEventListener('keyup', handleKeyUp, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown, {
                capture: true,
            });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
            document.removeEventListener('keydown', handleKeyDown, {
                capture: true,
            });
            document.removeEventListener('keyup', handleKeyUp, { capture: true });
        };
    }, [activateShield, instantBlurContent, wipeClipboard]);

    // ── Wrapper props ────────────────────────────────────────────
    const wrapperProps = {
        onCopy: (e: React.ClipboardEvent) => {
            if (!isInputElement(e.target)) {
                e.preventDefault();
                onCopyAttempt?.(
                    `Copying content is disabled during ${contentLabel.toLowerCase()}s.`,
                );
            }
        },
        onContextMenu: (e: React.MouseEvent) => {
            if (!isInputElement(e.target)) {
                e.preventDefault();
            }
        },
        onMouseDown: (e: React.MouseEvent) => {
            if (!isInteractiveElement(e.target)) {
                e.preventDefault();
            }
        },
        onDragStart: (e: React.DragEvent) => {
            e.preventDefault();
        },
    };

    return {
        isShielded,
        isResumeLocked,
        dismissShield,
        styleBlock: SHIELD_STYLE,
        contentRef,
        wrapperProps,
    };
}
