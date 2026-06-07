import { Head, useForm, router } from '@inertiajs/react';
import DOMPurify from 'dompurify';
import { Loader2, Save, FileText, Shield, Eye, Code } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface LegalContent {
    id?: number;
    type: 'privacy' | 'terms';
    content: string;
    updated_at?: string;
}

interface EditProps {
    privacy: LegalContent | null;
    terms: LegalContent | null;
}

export default function Edit({ privacy, terms }: EditProps) {
    const { data, setData, processing, errors, recentlySuccessful } = useForm({
        content: {
            privacy: privacy?.content || '',
            terms: terms?.content || '',
        },
    });

    const [activePrivacyTab, setActivePrivacyTab] = useState<
        'edit' | 'preview'
    >('edit');
    const [activeTermsTab, setActiveTermsTab] = useState<'edit' | 'preview'>(
        'edit',
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put('/admin/legal-content', data);
    };

    return (
        <>
            <Head title="Edit Legal Content" />

            <PageContainer>
                <PageHeader
                    title={<>Edit Legal Content</>}
                    description={
                        <>
                            Manage privacy policy and terms of service. Changes
                            will be reflected immediately on public pages.
                        </>
                    }
                />

                <form onSubmit={handleSubmit}>
                    <div className="mt-6 space-y-6">
                        {/* Privacy Policy */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Privacy Policy</CardTitle>
                                        <CardDescription>
                                            {privacy?.updated_at
                                                ? `Last updated: ${new Date(
                                                      privacy.updated_at,
                                                  ).toLocaleDateString()}`
                                                : 'Not yet created'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs
                                    value={activePrivacyTab}
                                    onValueChange={(v) =>
                                        setActivePrivacyTab(
                                            v as 'edit' | 'preview',
                                        )
                                    }
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="edit">
                                            <Code className="mr-2 h-4 w-4" />
                                            Edit HTML
                                        </TabsTrigger>
                                        <TabsTrigger value="preview">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent
                                        value="edit"
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="privacy-content">
                                                Content (HTML)
                                            </Label>
                                            <Textarea
                                                id="privacy-content"
                                                value={data.content.privacy}
                                                onChange={(e) =>
                                                    setData(
                                                        'content.privacy',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter privacy policy content in HTML format..."
                                                className="min-h-100 font-mono text-sm"
                                                rows={20}
                                            />
                                            {errors['content.privacy'] && (
                                                <p className="text-sm text-destructive">
                                                    {errors['content.privacy']}
                                                </p>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="preview">
                                        <Card className="border-2 border-dashed">
                                            <CardContent className="p-6">
                                                {data.content.privacy ? (
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: DOMPurify.sanitize(
                                                                data.content
                                                                    .privacy,
                                                            ),
                                                        }}
                                                        className="prose prose-slate dark:prose-invert max-w-none"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No content to preview
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Terms of Service */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>Terms of Service</CardTitle>
                                        <CardDescription>
                                            {terms?.updated_at
                                                ? `Last updated: ${new Date(
                                                      terms.updated_at,
                                                  ).toLocaleDateString()}`
                                                : 'Not yet created'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Tabs
                                    value={activeTermsTab}
                                    onValueChange={(v) =>
                                        setActiveTermsTab(
                                            v as 'edit' | 'preview',
                                        )
                                    }
                                >
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="edit">
                                            <Code className="mr-2 h-4 w-4" />
                                            Edit HTML
                                        </TabsTrigger>
                                        <TabsTrigger value="preview">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent
                                        value="edit"
                                        className="space-y-4"
                                    >
                                        <div className="space-y-2">
                                            <Label htmlFor="terms-content">
                                                Content (HTML)
                                            </Label>
                                            <Textarea
                                                id="terms-content"
                                                value={data.content.terms}
                                                onChange={(e) =>
                                                    setData(
                                                        'content.terms',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Enter terms of service content in HTML format..."
                                                className="min-h-100 font-mono text-sm"
                                                rows={20}
                                            />
                                            {errors['content.terms'] && (
                                                <p className="text-sm text-destructive">
                                                    {errors['content.terms']}
                                                </p>
                                            )}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="preview">
                                        <Card className="border-2 border-dashed">
                                            <CardContent className="p-6">
                                                {data.content.terms ? (
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: DOMPurify.sanitize(
                                                                data.content
                                                                    .terms,
                                                            ),
                                                        }}
                                                        className="prose prose-slate dark:prose-invert max-w-none"
                                                    />
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        No content to preview
                                                    </p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            {recentlySuccessful && (
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                    Saved successfully!
                                </p>
                            )}
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-w-30"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </PageContainer>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        {
            title: 'Legal Content',
            href: '/admin/legal-content',
        },
    ],
};
