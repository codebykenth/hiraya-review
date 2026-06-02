export interface ExamDate {
    id: number;
    date: string;
    description: string;
    is_active: boolean;
}

export interface ExamDateFormData {
    date: string;
    description: string;
    is_active: boolean;
}

export interface AdminExamDatesIndexProps {
    examDates: ExamDate[];
}
