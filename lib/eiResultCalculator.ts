// Emotional Intelligence Result Calculator

export interface EIDimension {
  dimension: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  tips: string[];
}

export interface EIResult {
  studentName: string;
  class: string;
  gender: string;
  completedAt: string;
  dimensions: EIDimension[];
  overallScore: number;
  overallMaxScore: number;
  overallPercentage: number;
  overallLevel: string;
}

const DIMENSION_INFO: Record<string, { label: string; description: string }> = {
  'self-awareness': {
    label: '🪞 Kesadaran Diri',
    description: 'Kemampuan mengenali dan memahami emosi sendiri'
  },
  'self-regulation': {
    label: '🎯 Pengelolaan Diri',
    description: 'Kemampuan mengelola dan mengontrol emosi'
  },
  'empathy': {
    label: '💝 Empati',
    description: 'Kemampuan memahami perasaan orang lain'
  },
  'relationship': {
    label: '🤝 Hubungan Sosial',
    description: 'Kemampuan membangun dan memelihara hubungan baik'
  },
  'motivation': {
    label: '⚡ Motivasi',
    description: 'Kemampuan termotivasi dan bersikap optimis'
  }
};

import { assessmentQuestions } from './assessmentQuestions';

// EI Questions from shared library
const EI_QUESTIONS = assessmentQuestions.emotional_intelligence || [];


export function calculateEIResult(
  studentName: string,
  schoolClass: string,
  gender: string,
  formData: Record<string, string | number>
): EIResult {
  const dimensions: EIDimension[] = [];
  let totalScore = 0;
  let totalMaxScore = 0;

  // Calculate score for each dimension
  Object.keys(DIMENSION_INFO).forEach((dimensionKey) => {
    const dimensionQuestions = EI_QUESTIONS.filter(q => q.dimension === dimensionKey);
    let dimensionScore = 0;
    let dimensionMaxScore = dimensionQuestions.length * 5; // 5 points per question

    dimensionQuestions.forEach(question => {
      const answer = formData[question.id];
      if (answer !== undefined) {
        dimensionScore += Number(answer);
      }
    });

    const percentage = (dimensionScore / dimensionMaxScore) * 100;
    const level = getLevelFromPercentage(percentage);
    const tips = getTipsForLevel(level, dimensionKey);

    dimensions.push({
      dimension: dimensionKey,
      label: DIMENSION_INFO[dimensionKey].label,
      score: dimensionScore,
      maxScore: dimensionMaxScore,
      percentage,
      level,
      tips
    });

    totalScore += dimensionScore;
    totalMaxScore += dimensionMaxScore;
  });

  const overallPercentage = (totalScore / totalMaxScore) * 100;
  const overallLevel = getLevelFromPercentage(overallPercentage);

  return {
    studentName,
    class: schoolClass,
    gender,
    completedAt: new Date().toISOString(),
    dimensions,
    overallScore: totalScore,
    overallMaxScore: totalMaxScore,
    overallPercentage,
    overallLevel
  };
}

function getLevelFromPercentage(percentage: number): string {
  if (percentage >= 80) return 'Sangat Baik';
  if (percentage >= 65) return 'Baik';
  if (percentage >= 50) return 'Cukup';
  return 'Perlu Dikembangkan';
}

function getTipsForLevel(level: string, dimension: string): string[] {
  const generalTips: Record<string, string[]> = {
    'Sangat Baik': [
      'Teruskan! Kemampuan ini sudah berkembang dengan baik.',
      'Jadilah mentor bagi teman yang masih berkembang.',
      'Tingkatkan terus dan aplikasikan dalam kehidupan sehari-hari.'
    ],
    'Baik': [
      'Anda sudah menunjukkan tanda-tanda positif.',
      'Terus latih kemampuan ini agar semakin kuat.',
      'Cari peluang untuk mempraktikkan lebih banyak.'
    ],
    'Cukup': [
      'Ada ruang besar untuk improvement.',
      'Mulai dengan satu aspek kecil dan tingkatkan secara bertahap.',
      'Minta feedback dari orang yang bisa dipercaya.'
    ],
    'Perlu Dikembangkan': [
      'Ini adalah area penting untuk fokus.',
      'Minta bantuan guru BK atau mentor untuk pengembangan lebih lanjut.',
      'Mulai dari hal-hal kecil dan jangan menyerah.'
    ]
  };

  return generalTips[level] || generalTips['Cukup'];
}
