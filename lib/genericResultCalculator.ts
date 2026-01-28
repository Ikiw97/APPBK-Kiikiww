import { Question } from './assessmentQuestions';

export interface GenericResult {
    scores: Record<string, number>;
    percentages: Record<string, number>;
    dominant: string;
    maxScorePerCategory: Record<string, number>;
    chartData: { label: string; value: number; fullMark: number }[];
}

export function calculateGenericResult(
    answers: Record<string, string>,
    questions: Question[]
): GenericResult {
    const scores: Record<string, number> = {};
    const itemCounts: Record<string, number> = {};

    // Initialize scores
    questions.forEach((q) => {
        if (!scores[q.category]) {
            scores[q.category] = 0;
            itemCounts[q.category] = 0;
        }
    });

    // Calculate scores
    questions.forEach((q) => {
        const answer = answers[q.id];
        if (answer) {
            itemCounts[q.category]++;

            // Determine score value (Standard Likert: 1-5 or 1-3)
            // Usually options are ordered negative to positive or positive to negative?
            // Check assessmentQuestions.ts:
            // personality_career: ['Sangat Tidak Suka' ... 'Sangat Suka'] -> 1 to 5.
            // Generic logic: index 0 is min, index N is max.

            const optionIndex = q.options.indexOf(answer);
            if (optionIndex !== -1) {
                // Assume linear scoring 1 to N
                scores[q.category] += (optionIndex + 1);
            }
        }
    });

    // Calculate percentages and dominant
    const percentages: Record<string, number> = {};
    const maxScorePerCategory: Record<string, number> = {};
    const chartData: { label: string; value: number; fullMark: number }[] = [];

    let dominant = '';
    let highestScore = -1;

    Object.keys(scores).forEach((category) => {
        const maxScore = itemCounts[category] * 5; // Assuming 5-point scale max
        // Note: If options length is 3 (like SDQ), max is 3. 
        // We should detect max points per question.
        // For now we use a heuristic based on options length of the first question of category.
        const categoryQuestions = questions.filter(q => q.category === category);
        const optionsLength = categoryQuestions[0]?.options.length || 5;

        const realMax = itemCounts[category] * optionsLength;
        maxScorePerCategory[category] = realMax;

        // Calculate percentage
        percentages[category] = Math.round((scores[category] / realMax) * 100);

        // Chart Data
        chartData.push({
            label: category,
            value: scores[category],
            fullMark: realMax
        });

        // Check dominant
        if (scores[category] > highestScore) {
            highestScore = scores[category];
            dominant = category;
        }
    });

    // Special Handling for MBTI to form the 4-letter code
    // If categories contains Extraversion/Introversion pairs, we shouldn't just pick one dominant.
    // We should pick one from each pair.
    const isMBTI = Object.keys(scores).some(k => k === 'Extraversion');
    if (isMBTI) {
        const pairs = [
            ['Extraversion', 'Introversion'],
            ['Sensing', 'Intuition'],
            ['Thinking', 'Feeling'],
            ['Judging', 'Perceiving']
        ];

        let code = '';
        pairs.forEach(([pole1, pole2]) => {
            const score1 = scores[pole1] || 0;
            const score2 = scores[pole2] || 0;
            if (score1 >= score2) {
                code += pole1[0]; // E
            } else {
                code += pole2[0]; // I
            }
        });
        dominant = code; // e.g. "ESTJ"
    }

    // Special Handling for Introvert/Extrovert (Single pair)
    const isIE = Object.keys(scores).includes('Introversion') && Object.keys(scores).includes('Extroversion') && !isMBTI;
    if (isIE) {
        const iScore = scores['Introversion'] || 0;
        const eScore = scores['Extroversion'] || 0;
        dominant = iScore > eScore ? 'Introvert' : 'Extrovert';
    }

    return {
        scores,
        percentages,
        dominant,
        maxScorePerCategory,
        chartData
    };
}
