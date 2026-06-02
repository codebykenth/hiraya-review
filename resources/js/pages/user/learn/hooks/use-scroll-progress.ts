import { useEffect, useRef } from 'react';

export function useScrollProgress() {
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let frameId = 0;

        const handleScroll = () => {
            if (frameId) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {
                const windScroll =
                    document.documentElement.scrollTop ||
                    document.body.scrollTop;
                const height =
                    (document.documentElement.scrollHeight ||
                        document.documentElement.clientHeight) -
                    document.documentElement.clientHeight;
                const scrolled = height > 0 ? (windScroll / height) * 100 : 0;

                if (progressRef.current) {
                    progressRef.current.style.transform = `scaleX(${Math.min(scrolled, 100) / 100})`;
                }

                frameId = 0;
            });
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, []);

    return progressRef;
}
