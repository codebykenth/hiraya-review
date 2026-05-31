import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import AppLogo from '@/components/app-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { home, dashboard, login, register } from '@/routes';
import type { Auth } from '@/types';

// Declare expected page props to satisfy TypeScript strict compiler checks
type PageProps = {
    auth: Auth;
};

interface SiteHeaderProps {
    activeNav?: string;
    onNavClick?: (id: string) => void;
}

export default function SiteHeader({
    activeNav = 'home',
    onNavClick,
}: SiteHeaderProps) {
    const { auth } = usePage<PageProps>().props;
    const { url } = usePage();
    const [scrollProgress, setScrollProgress] = useState(0);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Track scroll events to toggle navbar visibility and progress bar
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            const totalHeight =
                document.documentElement.scrollHeight - window.innerHeight;

            if (totalHeight > 0) {
                const progress = (currentScrollY / totalHeight) * 100;
                setScrollProgress(progress);
            }

            if (currentScrollY < 50) {
                setShowHeader(true);
            } else if (currentScrollY > lastScrollY) {
                setShowHeader(false);
            } else {
                if (!showHeader) {
                    setShowHeader(true);
                }
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, showHeader]);

    const navLinks = [
        { id: 'home', label: 'Home', href: '#' },
        { id: 'about', label: 'About Us', href: '/about' },
        { id: 'features', label: 'Features', href: '#features' },
        { id: 'path', label: 'Process', href: '#path' },
        { id: 'learn', label: 'Study Hub', href: '/learn' },
        { id: 'guide', label: 'Reviewer Guide', href: '#guide' },
        { id: 'faq', label: 'FAQ', href: '#faq' },
    ];

    // Compute navigation hrefs dynamically to handle cross-page anchoring correctly
    const getHref = (id: string, href: string) => {
        if (href.startsWith('/')) {
            return href;
        }

        // usePage().url gives us the current path consistently on both SSR and client
        const isHomePage = url === '/' || url === '';

        if (isHomePage) {
            return href;
        }

        return id === 'home' ? home().url : `${home().url}${href}`;
    };

    const handleLinkClick = (id: string) => {
        if (onNavClick) {
            onNavClick(id);
        }

        setIsMenuOpen(false);
    };

    return (
        <>
            <div
                className="fixed top-0 left-0 z-[99] h-[3.5px] bg-primary transition-all duration-100 ease-out"
                style={{
                    width: `${scrollProgress}%`,
                    opacity: showHeader ? 0 : 1,
                    pointerEvents: 'none',
                }}
            />

            <header
                className={`sticky top-0 left-0 z-50 w-full border-b border-gray-200 bg-white/90 text-sm backdrop-blur-md transition-all duration-300 not-has-[nav]:hidden dark:border-gray-800 dark:bg-black/90 ${
                    showHeader ? 'translate-y-0 shadow-sm' : '-translate-y-full'
                }`}
            >
                <nav className="container mx-auto flex items-center justify-between gap-2 px-4 py-3 xl:gap-4 lg:px-6 lg:py-4">
                    <div className="flex items-center">
                        <Link href={home()} className="flex items-center gap-2">
                            <AppLogo />
                        </Link>
                    </div>

                    {!auth.user && (
                        <div className="hidden xl:block">
                            <ul className="flex gap-6 font-medium">
                                {navLinks.map((link) => {
                                    const isLinkActive =
                                        activeNav === link.id ||
                                        (link.id === 'learn' && url.startsWith('/learn')) ||
                                        (link.id === 'about' && url.startsWith('/about'));
                                    const isHomePage =
                                        url === '/' || url === '';
                                    const isHomeActive =
                                        (link.id === 'learn' && url.startsWith('/learn')) ||
                                        (link.id === 'about' && url.startsWith('/about')) ||
                                        (isHomePage && isLinkActive);

                                    return (
                                        <li key={link.id}>
                                            <a
                                                href={getHref(
                                                    link.id,
                                                    link.href,
                                                )}
                                                onClick={() =>
                                                    handleLinkClick(link.id)
                                                }
                                                className={`border-b-2 pb-1 transition-all ${
                                                    isHomeActive
                                                        ? 'border-primary font-bold text-primary'
                                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                                                }`}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    <div className="hidden items-center gap-4 xl:flex">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link
                                        href={login()}
                                        className="font-bold text-primary"
                                    >
                                        Log in
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link
                                        href={register()}
                                        className="font-bold"
                                    >
                                        Register
                                    </Link>
                                </Button>
                            </>
                        )}
                        <ThemeToggle />
                    </div>

                    <div className="flex items-center gap-2 xl:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="relative z-50 flex items-center justify-center rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </nav>

                <div
                    className={`absolute top-full right-0 left-0 z-40 transform border-b border-slate-200 bg-white/95 backdrop-blur-lg transition-all duration-300 ease-in-out xl:hidden dark:border-slate-800 dark:bg-black/95 ${
                        isMenuOpen
                            ? 'translate-y-0 opacity-100'
                            : 'pointer-events-none -translate-y-10 opacity-0'
                    }`}
                >
                    <div className="container mx-auto flex flex-col gap-6 px-6 py-6">
                        {!auth.user && (
                            <>
                                <ul className="flex flex-col gap-4 text-base font-semibold">
                                    {navLinks.map((link) => {
                                        const isLinkActive =
                                            activeNav === link.id ||
                                            (link.id === 'learn' && url.startsWith('/learn')) ||
                                            (link.id === 'about' && url.startsWith('/about'));
                                        const isHomePage =
                                            url === '/' || url === '';
                                        const isHomeActive =
                                            (link.id === 'learn' && url.startsWith('/learn')) ||
                                            (link.id === 'about' && url.startsWith('/about')) ||
                                            (isHomePage && isLinkActive);

                                        return (
                                            <li key={link.id}>
                                                <a
                                                    href={getHref(
                                                        link.id,
                                                        link.href,
                                                    )}
                                                    onClick={() =>
                                                        handleLinkClick(link.id)
                                                    }
                                                    className={`block py-1 transition-all ${
                                                        isHomeActive
                                                            ? 'font-bold text-primary'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>

                                <div className="bg-slate-150 h-[1px] w-full dark:bg-slate-800" />
                            </>
                        )}

                        <div className="flex flex-col gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-950"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-xl py-6 text-base font-bold text-primary"
                                        asChild
                                    >
                                        <Link
                                            href={login()}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Log in
                                        </Link>
                                    </Button>
                                    <Button
                                        className="w-full rounded-xl py-6 text-base font-bold"
                                        asChild
                                    >
                                        <Link
                                            href={register()}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Register
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
