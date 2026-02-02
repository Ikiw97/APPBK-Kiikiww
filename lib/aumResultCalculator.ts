import { AUM_CATEGORIES, getAUMQuestions, getAUMQuestionsWithCustom, getSeverityLevel } from './assessmentQuestions';

export interface AnswerScore {
  questionId: string;
  questionText: string;
  category: string;
  categoryId: string;
  score: number;
  frequency: string;
}

export interface CategoryScore {
  categoryId: string;
  categoryName: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  severity: { level: string; color: string; emoji: string };
}

export interface AUMResult {
  studentName: string;
  class: string;
  gender: string;
  completedAt: string;
  categoryScores: CategoryScore[];
  allAnswerScores: AnswerScore[];
  topThreeProblems: AnswerScore[];
  topFifteenProblems: AnswerScore[];
  topProblemPerCategory: Record<string, AnswerScore>;
}

const FREQUENCY_SCORES: Record<string, number> = {
  'Tidak Pernah': 1,
  'Kadang-kadang': 2,
  'Sering': 3,
  'Selalu': 4,
};

export function calculateAUMResult(
  studentName: string,
  className: string,
  gender: string,
  answers: Record<string, string>
): AUMResult {
  const questions = getAUMQuestionsWithCustom();
  const categoryScores: CategoryScore[] = [];
  const allAnswerScores: AnswerScore[] = [];

  // Calculate scores for each category and collect all answers
  AUM_CATEGORIES.forEach((category) => {
    const categoryQuestions = questions.filter((q) => q.categoryId === category.id);
    let categoryTotal = 0;

    categoryQuestions.forEach((question) => {
      const answerKey = `question_${questions.indexOf(question)}`;
      const answer = answers[answerKey] || 'Tidak Pernah';
      const score = FREQUENCY_SCORES[answer] || 1;
      categoryTotal += score;

      allAnswerScores.push({
        questionId: question.id,
        questionText: question.text,
        category: category.name,
        categoryId: category.id,
        score: score,
        frequency: answer,
      });
    });

    const maxScore = categoryQuestions.length * 4;
    const percentage = (categoryTotal / maxScore) * 100;
    const severity = getSeverityLevel(categoryTotal);

    categoryScores.push({
      categoryId: category.id,
      categoryName: category.name,
      totalScore: categoryTotal,
      maxScore: maxScore,
      percentage: Math.round(percentage),
      severity,
    });
  });

  // Now that all answers are collected, get top problem per category
  const topProblemPerCategory: Record<string, AnswerScore> = {};
  AUM_CATEGORIES.forEach((category) => {
    const categoryProblems = allAnswerScores.filter(
      (ans) => ans.categoryId === category.id
    );
    const topProblem = categoryProblems.sort((a, b) => b.score - a.score)[0];
    if (topProblem) {
      topProblemPerCategory[category.id] = topProblem;
    }
  });

  // Sort all answers by score (descending) to get top 15
  const sortedAnswers = [...allAnswerScores].sort((a, b) => b.score - a.score);
  const topFifteenProblems = sortedAnswers.slice(0, 15);

  // Get top 3 problems from categories (highest scores)
  const topThreeProblems = sortedAnswers.slice(0, 3);

  return {
    studentName,
    class: className,
    gender,
    completedAt: new Date().toISOString(),
    categoryScores,
    allAnswerScores,
    topThreeProblems,
    topFifteenProblems,
    topProblemPerCategory,
  };
}
