import type { Question, ReviewStatusFilter, LiveStatusFilter } from '../types';
import { isDemographicQuestion } from './exam-utils';

export function matchesReviewFilter(
    q: Question,
    idx: number,
    answers: Record<number, number>,
    flagged: Record<number, boolean>,
    filters: {
        category: string;
        subcategory: string;
        status: ReviewStatusFilter;
    },
): boolean {
    if (filters.category !== 'All Categories' && q.category !== filters.category) {
        return false;
    }

    if (
        filters.subcategory !== 'All Subcategories' &&
        (q.subcategory || 'General Concepts') !== filters.subcategory
    ) {
        return false;
    }

    const chosen = answers[idx];
    const isCorrect =
        chosen !== undefined &&
        chosen !== null &&
        Number(chosen) === Number(q.correct_option);
    const isDemographic = isDemographicQuestion(q);

    if (filters.status === 'correct') {
        if (isDemographic || !isCorrect) {
return false;
}
    }

    if (filters.status === 'incorrect') {
        if (isDemographic || isCorrect) {
return false;
}
    }

    if (filters.status === 'flagged') {
        if (!flagged[idx]) {
return false;
}
    }

    return true;
}

export function matchesLiveFilter(
    idx: number,
    answers: Record<number, number>,
    flagged: Record<number, boolean>,
    status: LiveStatusFilter,
): boolean {
    const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
    const isFlagged = flagged[idx] === true;

    if (status === 'answered') {
return isAnswered;
}

    if (status === 'unanswered') {
return !isAnswered;
}

    if (status === 'flagged') {
return isFlagged;
}

    return true;
}
