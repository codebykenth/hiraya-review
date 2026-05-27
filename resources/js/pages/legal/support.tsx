import { Head, useForm } from '@inertiajs/react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, ShieldAlert, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { store as supportStore } from '@/routes/support';

export default function Support() {
    const [submitted, setSubmitted] = useState(false);
    const [submittedData, setSubmittedData] = useState<{ name: string; email: string } | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(supportStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmittedData({ name: data.name, email: data.email });
                setSubmitted(true);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Contact Support" />
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav="" />

                <main className="flex-1 py-12 px-6">
                    <div className="mx-auto max-w-5xl">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                    Contact Support
                                </h1>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    Have a question or feedback? We are here to help you succeed.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            {/* Left Side: Support Channels Info */}
                            <div className="space-y-6 lg:col-span-1">


                                <Card className="p-6 space-y-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Community & Feedback</h3>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                            Found a buggy question or want to suggest an explanation improvement? Contact us directly.
                                        </p>
                                    </div>
                                </Card>

                                <Card className="p-6 space-y-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-455">
                                        <ShieldAlert className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground">Unofficial Portal Note</h3>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                            Please note that we cannot answer official Civil Service Commission schedule or processing questions. Contact the CSC directly for exam filing dates.
                                        </p>
                                    </div>
                                </Card>
                            </div>

                            {/* Right Side: Contact Form */}
                            <div className="lg:col-span-2">
                                <Card className="p-8 md:p-10">
                                    {submitted ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 mb-4">
                                                <Mail className="h-6 w-6" />
                                            </div>
                                            <h2 className="text-xl font-bold text-foreground">Message Received!</h2>
                                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground animate-fade-in">
                                                Thanks for reaching out, {submittedData?.name}. We will review your message and reply via email at {submittedData?.email} within 24 hours.
                                            </p>
                                            <div className="mt-6 rounded-lg border border-amber-200/50 bg-amber-50/50 p-3 text-xs font-semibold text-amber-800 flex items-start gap-2.5 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 max-w-2xl">
                                                <span>You have successfully sent your support request. You can submit another message tomorrow.</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {(errors as any).rate_limit && (
                                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5 dark:bg-red-950/20 dark:border-red-900/30">
                                                    <span>{(errors as any).rate_limit}</span>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label htmlFor="name" className="text-xs font-bold text-foreground">
                                                        Your Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="name"
                                                        required
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        placeholder="Juan Dela Cruz"
                                                        className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground transition focus:border-blue-500 focus:outline-none dark:bg-slate-900 ${errors.name ? 'border-red-500' : 'border-border'
                                                            }`}
                                                    />
                                                    {errors.name && (
                                                        <p className="text-xs font-semibold text-red-650 mt-1">{errors.name}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="email" className="text-xs font-bold text-foreground">
                                                        Email Address
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        required
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        placeholder="juan@example.com"
                                                        className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground transition focus:border-blue-500 focus:outline-none dark:bg-slate-900 ${errors.email ? 'border-red-500' : 'border-border'
                                                            }`}
                                                    />
                                                    {errors.email && (
                                                        <p className="text-xs font-semibold text-red-650 mt-1">{errors.email}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label htmlFor="message" className="text-xs font-bold text-foreground">
                                                    Your Message
                                                </label>
                                                <textarea
                                                    id="message"
                                                    required
                                                    rows={5}
                                                    value={data.message}
                                                    onChange={(e) => setData('message', e.target.value)}
                                                    placeholder="How can we help you? Please describe your request or question in detail..."
                                                    className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-foreground transition focus:border-blue-500 focus:outline-none dark:bg-slate-900 ${errors.message ? 'border-red-500' : 'border-border'
                                                        }`}
                                                />
                                                {errors.message && (
                                                    <p className="text-xs font-semibold text-red-650 mt-1">{errors.message}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                                                <Button type="submit" loading={processing} className="w-full sm:w-auto font-bold flex items-center justify-center gap-2">
                                                    Send Message
                                                    <ArrowRight className="h-4 w-4" />
                                                </Button>
                                                <p className="text-[11px] font-medium text-muted-foreground">
                                                    * To prevent spam, submissions are limited to 1 message per day.
                                                </p>
                                            </div>
                                        </form>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
