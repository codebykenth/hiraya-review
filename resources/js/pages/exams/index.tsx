import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { index as examsIndex } from '@/routes/exams';

type Exam = {
    id: number;
    title: string;
    questions: number;
};

type ExamIndexProps = {
    exams: Exam[];
};

export default function ExamIndex({ exams }: ExamIndexProps) {
    return (
        <>
            <Head title="Exams" />

            <div className="p-6">
                <h1 className="mb-6 text-2xl font-bold">Available Exams</h1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <Card
                            key={exam.id}
                            className="transition-shadow hover:shadow-lg"
                        >
                            <CardHeader>
                                <CardTitle>{exam.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="secondary">
                                    {exam.questions} questions
                                </Badge>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

ExamIndex.layout = {
    breadcrumbs: [
        {
            title: 'Exams',
            href: examsIndex(),
        },
    ],
};
