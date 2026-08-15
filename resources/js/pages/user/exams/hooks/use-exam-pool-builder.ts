import { useCallback, useMemo } from 'react';
import { fallbackDemographicQuestions } from '@/data/fallback-demographics';
import type { Question } from '../types';
import { fisherYatesShuffle, isDemographicQuestion, EXAM_CONSTANTS } from '../utils/exam-utils';

export function shuffleOptionsForQuestion(q: Question): Question {
    let options = q.options;
    let correctOption = q.correct_option;

    if (options.length > 5) {
        options = options.slice(0, 5);

        if (correctOption >= 5) {
            correctOption = 0;
        }
    }

    const indices = options.map((_, i) => i);
    const shuffledIndices = fisherYatesShuffle(indices);

    const shuffledOptions = shuffledIndices.map((i) => options[i]);
    const newCorrect = shuffledIndices.indexOf(correctOption);

    return {
        ...q,
        options: shuffledOptions,
        correct_option: newCorrect,
        originalOptionIndices: shuffledIndices,
    };
}

interface UseExamPoolBuilderProps {
    questions?: Question[];
    seenQuestionIdsByTrack?: {
        Professional: number[];
        Subprofessional: number[];
        Drill: number[];
    };
    wrongQuestionIdsByTrack?: {
        Professional: number[];
        Subprofessional: number[];
        Drill: number[];
    };
    selectedExamId: number | null;
    activeQuestions: Question[];
}

export function useExamPoolBuilder({
    questions = [],
    seenQuestionIdsByTrack = { Professional: [], Subprofessional: [], Drill: [] },
    wrongQuestionIdsByTrack = { Professional: [], Subprofessional: [], Drill: [] },
    selectedExamId,
    activeQuestions,
}: UseExamPoolBuilderProps) {
    const fallbackQuestions: Question[] = questions;
    const demographicQuestions: Question[] = useMemo(
        () => questions.filter((q) => isDemographicQuestion(q)),
        [questions],
    );

    const getTrackNameForExam = useCallback((examId: number | null) => {
        return examId === 2 ? 'Subprofessional' : 'Professional';
    }, []);

    const getSeenIdsForExam = useCallback(
        (examId: number | null) => {
            const track = getTrackNameForExam(examId);
            const fromServer = seenQuestionIdsByTrack[track as keyof typeof seenQuestionIdsByTrack] ?? [];
            const fromCurrentSession =
                selectedExamId === examId && activeQuestions.length > 0
                    ? activeQuestions.map((q) => q.id)
                    : [];

            return [...new Set([...fromServer, ...fromCurrentSession])];
        },
        [seenQuestionIdsByTrack, selectedExamId, activeQuestions, getTrackNameForExam],
    );

    const getWrongIdsForExam = useCallback(
        (examId: number | null) => {
            const track = getTrackNameForExam(examId);
            const fromServer = wrongQuestionIdsByTrack[track as keyof typeof wrongQuestionIdsByTrack] ?? [];

            return [...new Set(fromServer)];
        },
        [wrongQuestionIdsByTrack, getTrackNameForExam],
    );

    const buildFreshExamPool = useCallback(
        (examId: number | null) => {
            const sourcePool = questions.length > 0 ? questions : fallbackQuestions;

            const verbalPool = sourcePool.filter((q) => q.category === 'Verbal Ability');
            const analyticalPool = sourcePool.filter((q) => q.category === 'Analytical Ability');
            const numericalPool = sourcePool.filter((q) => q.category === 'Numerical Ability');
            const clericalPool = sourcePool.filter((q) => q.category === 'Clerical Ability');
            const generalPool = sourcePool.filter((q) => q.category === 'General Information');

            const seenSet = new Set(getSeenIdsForExam(examId));
            const wrongSet = new Set(getWrongIdsForExam(examId));

            const pickFlat = (
                pool: Question[],
                count: number,
                catName: string,
                subName?: string,
            ): Question[] => {
                const wrongFromSeen = pool.filter((q) => wrongSet.has(q.id));
                const unseen = pool.filter((q) => !seenSet.has(q.id));
                const seenCorrect = pool.filter((q) => seenSet.has(q.id) && !wrongSet.has(q.id));

                const picked: Question[] = [];

                const pushWithLimit = (items: Question[], quota: number) => {
                    let added = 0;

                    for (const q of items) {
                        if (added >= quota) {
break;
}

                        if (picked.some((p) => p.id === q.id)) {
continue;
}

                        picked.push(q);
                        added++;
                    }
                };

                const wrongQuota = Math.ceil(count * EXAM_CONSTANTS.WRONG_PRIORITY_PERCENTAGE);
                const wrongPicked = fisherYatesShuffle(wrongFromSeen);
                pushWithLimit(wrongPicked, wrongQuota);

                let remaining = count - picked.length;

                if (remaining > 0) {
                    pushWithLimit(fisherYatesShuffle(unseen), remaining);
                }

                remaining = count - picked.length;

                if (remaining > 0) {
                    pushWithLimit(fisherYatesShuffle(seenCorrect), remaining);
                }

                remaining = count - picked.length;

                if (remaining > 0) {
                    pushWithLimit(fisherYatesShuffle(wrongPicked), remaining);
                }

                if (picked.length < count) {
                    const fbPool = fallbackQuestions.filter(
                        (q) =>
                            q.category === catName &&
                            (!subName || q.subcategory === subName) &&
                            !picked.some((p) => p.id === q.id),
                    );
                    pushWithLimit(fisherYatesShuffle(fbPool), count - picked.length);
                }

                while (picked.length < count && picked.length > 0) {
                    picked.push(picked[Math.floor(Math.random() * picked.length)]);
                }

                return fisherYatesShuffle(picked.slice(0, count));
            };

            const pickBalanced = (
                pool: Question[],
                targetCount: number,
                catName: string,
                splitLanguage = false,
            ): Question[] => {
                const groups: Record<string, Question[]> = {};
                pool.forEach((q) => {
                    const key = q.subcategory || 'General';

                    if (!groups[key]) {
groups[key] = [];
}

                    groups[key].push(q);
                });

                const subcatNames = Object.keys(groups);

                if (subcatNames.length === 0) {
                    return pickFlat(pool, targetCount, catName);
                }

                const baseQuota = Math.floor(targetCount / subcatNames.length);
                let remainder = targetCount % subcatNames.length;
                const picked: Question[] = [];

                for (const subName of subcatNames) {
                    const quota = baseQuota + (remainder > 0 ? 1 : 0);

                    if (remainder > 0) {
remainder--;
}

                    const subPool = groups[subName];

                    if (splitLanguage || subName === 'Word analogy') {
                        const engPool = subPool.filter((q) => {
                            const lang = (q.language || '').toLowerCase();

                            return lang === 'english' || lang === '';
                        });
                        const filPool = subPool.filter((q) => {
                            const lang = (q.language || '').toLowerCase();

                            return lang.includes('filipino') || lang.includes('tagalog');
                        });

                        const filQuota = filPool.length > 0 ? Math.min(Math.floor(quota / 2), filPool.length) : 0;
                        const engQuota = quota - filQuota;

                        picked.push(
                            ...pickFlat(engPool, engQuota, catName, subName),
                            ...pickFlat(filPool, filQuota, catName, subName),
                        );
                    } else {
                        picked.push(...pickFlat(subPool, quota, catName, subName));
                    }
                }

                return fisherYatesShuffle(picked.slice(0, targetCount));
            };

            const scoredPool: Question[] = [];

            if (examId === 1) {
                // Professional: 150 scored
                scoredPool.push(...pickBalanced(verbalPool, 45, 'Verbal Ability', true));
                scoredPool.push(...pickBalanced(analyticalPool, 52, 'Analytical Ability'));
                scoredPool.push(...pickBalanced(numericalPool, 45, 'Numerical Ability'));
                scoredPool.push(...pickBalanced(generalPool, 8, 'General Information'));
            } else {
                // Subprofessional: 145 scored
                scoredPool.push(...pickBalanced(verbalPool, 45, 'Verbal Ability', true));
                scoredPool.push(...pickBalanced(clericalPool, 47, 'Clerical Ability'));
                scoredPool.push(...pickBalanced(numericalPool, 45, 'Numerical Ability'));
                scoredPool.push(...pickBalanced(generalPool, 8, 'General Information'));
            }

            let finalDemographics = [...demographicQuestions];

            if (finalDemographics.length < EXAM_CONSTANTS.DEMOGRAPHIC_QUESTION_COUNT) {
                const needed = EXAM_CONSTANTS.DEMOGRAPHIC_QUESTION_COUNT - finalDemographics.length;
                const shuffledFallbacks = fisherYatesShuffle(fallbackDemographicQuestions);
                finalDemographics = [...finalDemographics, ...shuffledFallbacks.slice(0, needed)];
            } else if (finalDemographics.length > EXAM_CONSTANTS.DEMOGRAPHIC_QUESTION_COUNT) {
                finalDemographics = fisherYatesShuffle(finalDemographics).slice(
                    0,
                    EXAM_CONSTANTS.DEMOGRAPHIC_QUESTION_COUNT,
                );
            }

            finalDemographics = fisherYatesShuffle(finalDemographics);
            const finalPool = [...finalDemographics, ...scoredPool];

            return finalPool.map(shuffleOptionsForQuestion);
        },
        [questions, fallbackQuestions, demographicQuestions, getSeenIdsForExam, getWrongIdsForExam],
    );

    return {
        buildFreshExamPool,
        demographicQuestions,
        fallbackQuestions,
    };
}
